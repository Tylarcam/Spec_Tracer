
import LogTrace from "@/components/LogTrace";

const Index = () => {
  try {
    return <LogTrace />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Application Error</h1>
          <p>Unable to load LogTrace. Please refresh the page.</p>
        </div>
      </div>
    );
  }
};

export default Index;
