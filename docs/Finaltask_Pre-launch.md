1. Add a loveable demo walk through - lovable is great at making these. 
2. Create an one click context engine will tht take the ui on screen analyzes the element and details tranforms it into a prompt based on user instructions. 

3. update the temrinal edit and modification to the chrome extension. 


error: When the debugger is opened using the chrome extension the the blue highligted section rremains in the way. 



Alignment in ui between the web app demo and the ui of the chrome extension. (icons sleek temrinal colors ui. Although the way the text is structured is way cleaner to read.)






Test the Full Flow
Inspect an element, add user intent, generate the prompt, and copy it.
Paste into ChatGPT/Cursor and verify the context is clear and actionable.
Would you like me to start with Step 2 (add the user intent input in the Interactive Panel or Debug Modal)? If so, which UI location do you prefer for the intent input and prompt preview:
Interactive Panel (side panel on inspect)
Debug Modal (full modal on debug)
New “Prompt” tab in the terminal
Let me know your preference and I’ll implement the next step!


July 14, 2025: Today work plan to pre-launch 


TLDR: Yesterday we made some edits to the debugger modal panel and change it to the context editor. 
1. Set up Stripe place holder
2. Created a Example Walk Through in the demo how to use 
3. Aligned the Sign in modal ( still some error below)
4. updated the landing page.  


Today's Task: 

Chrome Extension Focus. 
Right now there is an error with the sign in flow for the chrome app. 

Current User Flow:  User installs app, activate it in the extensions. > The modal panel pops open asking user to active toggle and openai api key. > User adds this information and activate the mouse cursor tool. > user then searches and app finds something that doesnt work > presses ctrl d to inspect the element. > User puts in some information about the element they want to know more about, fix, modify funcionality. > User then proceeds to app calls api to chat gpt and responds in the terminal (this step is being block by user sign sign in, when a user signs up or log-in to there acccount there are stuck a a sign up loop when they try to use the debugger assistant) 

Priority Fixes :

1. We have to fix the sign-in flow and logic. 
context: I am currently using supabase in our main web  debugger app, this is working great for sign in. I need to ensue this logic and connection information works for the sign in flow for the user on the chrome extension app.

Improvements to flow: 


Updates and Enhancement: 







( lets modify this and have a modal response pop up on screen and stay there until user closes the modal by clicking x or uses the esc key. In the modal needs to be a way to quick copy the text, edit, and or respond and send a follow up).

It's also missing the context enginnering modal update that is in the main app. 




2. Also we need to improve the landing copy once and for all. 


--WIP
1. Just pulled down the correct lovable data. 
2. Corected the Terminal descreprcy  created yesterday. 
3. Change the daily debug limit from 3 to upgrade to a freemium model where a user gets 5 a day or upgrade to pro.
4. Fix the sign in user flow on chrome extension
5. update the final panel ui edits for chrome.
6. chrome ui modal updates
    a. enhance the copy selector ( this is not that helpful it oly copies tha class) 
7. Add quick screenshot features of the Element inspector information and the halo over the element that will provide all the context needed along side agenerated prompt. ( the is the final aim, one click full context and prompt with user modification intent )