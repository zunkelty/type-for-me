import { Check, Pencil, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SettingsSection } from "@/components/settings/settings-section";
import { cn } from "@/lib/utils";
import { useShortcutRecorder } from "../hooks/use-shortcut-recorder";
import { ShortcutPills } from "./shortcut-pills";

export function ShortcutSection() {
  const {
    eventState,
    shortcut,
    draftShortcut,
    isEditing,
    isRecording,
    isSaving,
    errorMessage,
    helperText,
    beginEditing,
    cancelEditing,
    saveShortcut,
  } = useShortcutRecorder();

  return (
    <SettingsSection
      title="Shortcut"
      subtitle="Configure the hold-to-record shortcut for transcription."
    >
      <div className="space-y-3">
        <InputGroup
          className={cn(
            "max-w-xl",
            isEditing && "border-ring ring-ring/30 ring-2",
          )}
        >
          <InputGroupInput
            readOnly
            value=""
            aria-label="Transcription shortcut"
            className="text-transparent caret-transparent select-none"
          />

          <InputGroupAddon align="inline-start" className="pointer-events-none">
            <ShortcutPills
              shortcut={shortcut}
              isActive={eventState === "Pressed"}
            />
          </InputGroupAddon>

          <InputGroupAddon align="inline-end">
            {!isEditing ? (
              <InputGroupButton
                size="icon-xs"
                aria-label="Edit shortcut"
                onClick={beginEditing}
              >
                <Pencil />
              </InputGroupButton>
            ) : isRecording ? (
              <InputGroupButton
                size="icon-xs"
                aria-label="Cancel editing"
                onClick={cancelEditing}
              >
                <X />
              </InputGroupButton>
            ) : (
              <>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Save shortcut"
                  onClick={saveShortcut}
                  disabled={!draftShortcut || isSaving}
                >
                  <Check />
                </InputGroupButton>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Cancel editing"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  <X />
                </InputGroupButton>
              </>
            )}
          </InputGroupAddon>
        </InputGroup>

        <p className="text-sm text-muted-foreground">{helperText}</p>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    </SettingsSection>
  );
}
