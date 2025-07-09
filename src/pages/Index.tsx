
import LogTrace from "@/components/LogTrace";

const Index = () => {
  console.log('Index component rendering');
  
  try {
    return <LogTrace />;
  } catch (error) {
    console.error('Error rendering LogTrace:', error);
    return <div>Error loading LogTrace: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }
};

export default Index;
