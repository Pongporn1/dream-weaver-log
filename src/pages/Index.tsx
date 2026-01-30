import { AnimatedSection } from "@/components/ui/animated";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AnimatedSection delay={0} duration={500} animation="scale">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
          <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
