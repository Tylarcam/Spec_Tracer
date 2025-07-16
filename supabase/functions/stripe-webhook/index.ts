import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          plan_type: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          plan_type?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          plan_type?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripe = {
  async verifyWebhookSignature(body: string, signature: string): Promise<any> {
    // In production, implement proper Stripe webhook signature verification
    // For now, we'll parse the JSON directly
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }
  }
};

async function handleSubscriptionEvent(event: any) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  
  console.log(`Processing ${event.type} for subscription ${subscriptionId}`);

  // Find user by customer ID
  const { data: userSub, error: findError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError || !userSub) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const subscriptionData = {
    stripe_subscription_id: subscriptionId,
    subscription_status: subscription.status,
    plan_type: subscription.items.data[0]?.price?.lookup_key || 'pro',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update(subscriptionData)
    .eq('user_id', userSub.user_id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }

  console.log(`Successfully updated subscription for user ${userSub.user_id}`);
}

async function handleCustomerEvent(event: any) {
  const customer = event.data.object;
  const customerId = customer.id;
  const customerEmail = customer.email;

  console.log(`Processing ${event.type} for customer ${customerId}`);

  if (!customerEmail) {
    console.error('No email found for customer:', customerId);
    return;
  }

  // Find user by email in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }

  const user = authUser.users.find(u => u.email === customerEmail);
  if (!user) {
    console.error('User not found for email:', customerEmail);
    return;
  }

  // Create or update user subscription record
  const { error: upsertError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      subscription_status: 'inactive',
      plan_type: 'free'
    }, {
      onConflict: 'user_id'
    });

  if (upsertError) {
    console.error('Error upserting subscription:', upsertError);
    throw upsertError;
  }

  console.log(`Successfully processed customer event for user ${user.id}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const event = await stripe.verifyWebhookSignature(body, signature);

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(event);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event);
        break;

      case 'invoice.payment_succeeded':
        // Optionally handle successful payments
        console.log('Payment succeeded for subscription:', event.data.object.subscription);
        break;

      case 'invoice.payment_failed':
        // Handle failed payments
        console.log('Payment failed for subscription:', event.data.object.subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 