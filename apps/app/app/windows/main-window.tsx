import { Outlet } from "react-router";
import { FeatureErrorBoundary } from "@/components/error";
import PageLayout from "@/components/page-layout";
import { useTranscriptionRuntime } from "@/hooks/use-transcription-runtime";

function TranscriptionRuntimeProvider({ children }: { children: React.ReactNode }) {
  useTranscriptionRuntime();
  return <>{children}</>;
}

export function MainWindow() {
  return (
    <FeatureErrorBoundary
      featureName="Transcription"
      fallbackProps={{
        message: "Unable to initialize transcription. Please restart the app.",
      }}
    >
      <TranscriptionRuntimeProvider>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </TranscriptionRuntimeProvider>
    </FeatureErrorBoundary>
  );
}
