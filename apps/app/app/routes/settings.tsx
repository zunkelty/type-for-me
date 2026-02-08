import type { KeyboardEvent } from "react";
import { FileText, Mic } from "lucide-react";
import { Page } from "@/components/page";
import { TranscriptionShortcutSection } from "@/components/settings/transcription-shortcut-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function meta() {
  return [
    { title: "Settings | Type For Me" },
    {
      name: "description",
      content: "Configure plugin slots for transcription and formatting.",
    },
  ];
}

export default function Settings() {
  const handleSelectPlugin = (slotId: string) => {
    void slotId;
    // TODO: Open plugin picker dialog for this slot.
  };

  const handleEmptyKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    slotId: string,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleSelectPlugin(slotId);
  };

  return (
    <Page title="Settings">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl tracking-tight">
              Configure transcription
            </CardTitle>
            <CardDescription className="max-w-3xl">
              Choose which plugins power each stage of your transcription
              pipeline.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <section className="space-y-4 border-b pb-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">Transcription</CardTitle>
                  <CardDescription>
                    Convert incoming audio into text.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Required</Badge>
              </div>

              <Empty
                role="button"
                tabIndex={0}
                onClick={() => handleSelectPlugin("transcription")}
                onKeyDown={(event) =>
                  handleEmptyKeyDown(event, "transcription")
                }
                className="cursor-pointer bg-muted/20 transition-colors hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Mic className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No transcription plugin selected</EmptyTitle>
                  <EmptyDescription>
                    Choose a plugin to handle speech-to-text for voice
                    recordings.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectPlugin("transcription");
                    }}
                  >
                    Select plugin
                  </Button>
                </EmptyContent>
              </Empty>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">Formatting</CardTitle>
                  <CardDescription>
                    Clean up transcript structure, punctuation, and readability.
                  </CardDescription>
                </div>
              </div>

              <Empty
                role="button"
                tabIndex={0}
                onClick={() => handleSelectPlugin("formatting")}
                onKeyDown={(event) => handleEmptyKeyDown(event, "formatting")}
                className="cursor-pointer bg-muted/20 transition-colors hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No formatting plugin selected</EmptyTitle>
                  <EmptyDescription>
                    Choose a plugin to format transcript output before it is
                    displayed or exported.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectPlugin("formatting");
                    }}
                  >
                    Select plugin
                  </Button>
                </EmptyContent>
              </Empty>
            </section>
          </CardContent>
        </Card>

        <TranscriptionShortcutSection />
      </div>
    </Page>
  );
}
