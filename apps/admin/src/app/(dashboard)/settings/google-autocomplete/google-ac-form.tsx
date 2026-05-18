"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toasts";

type ActionResult = { success: boolean; error?: string } | null;

type Config = {
  apiKey: string | null;
  pricePerSession: number;
  pricePerGeocode: number;
  isEnabled: boolean;
};

type Props = {
  config: Config;
  saveAction: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function GoogleAcForm({ config, saveAction }: Props) {
  const [result, formAction, isPending] = useActionState(saveAction, null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      appToast.settingsChanged("Google Autocomplete settings saved.");
    } else {
      appToast.settingsError(result.error ?? "Failed to save settings.");
    }
  }, [result]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Enable Google Autocomplete</p>
          <p className="text-xs text-muted-foreground">
            When disabled, no merchants can use the feature regardless of their
            individual settings.
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            id="isEnabled"
            name="isEnabled"
            type="checkbox"
            defaultChecked={config.isEnabled}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
          <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <Label htmlFor="apiKey">Google Places API Key</Label>
        <div className="relative">
          <Input
            id="apiKey"
            name="apiKey"
            type={showKey ? "text" : "password"}
            defaultValue={config.apiKey ?? ""}
            placeholder="Leave blank to use environment variable"
            autoComplete="off"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          If set, this key overrides the GOOGLE_PLACES_API_KEY environment
          variable. Leave blank to use the env fallback.
        </p>
      </div>

      {/* Pricing reference table */}
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Pricing reference</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Google&apos;s cost</th>
                <th className="pb-2 pr-4 font-medium">Recommended price</th>
                <th className="pb-2 font-medium">Markup</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">Autocomplete session</td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">$0.0100</td>
                <td className="py-2 pr-4 font-mono font-medium">$0.0500</td>
                <td className="py-2 font-mono text-emerald-600">5x</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Geocode request (map/locate)</td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">$0.0050</td>
                <td className="py-2 pr-4 font-mono font-medium">$0.0100</td>
                <td className="py-2 font-mono text-emerald-600">2x</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Competitors: Smarty $0.050/lookup, Loqate $0.041–$0.047/lookup, AWS Location $0.011/request.
          Recommended prices match or undercut premium competitors while maintaining healthy margin.
        </p>
      </div>

      {/* Pricing inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pricePerSession">Price per autocomplete session (USD)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              id="pricePerSession"
              name="pricePerSession"
              type="number"
              min="0"
              step="0.0001"
              defaultValue={config.pricePerSession}
              className="w-32"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Charged when a customer selects an autocomplete suggestion.
            Google&apos;s actual cost: <span className="font-mono">$0.0100</span>/session.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pricePerGeocode">Price per geocode request (USD)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              id="pricePerGeocode"
              name="pricePerGeocode"
              type="number"
              min="0"
              step="0.0001"
              defaultValue={config.pricePerGeocode}
              className="w-32"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Charged per map picker confirmation or auto-locate resolve.
            Google&apos;s actual cost: <span className="font-mono">$0.0050</span>/request.
          </p>
        </div>
      </div>

      <div className="pt-1">
        <Button type="submit" disabled={isPending}>
          <MapPin className="mr-2 size-4" />
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
