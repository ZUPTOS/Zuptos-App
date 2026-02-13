import { useEffect, useState } from "react";

import type { MembersSettings } from "../settings.types";

const buildMockSettings = (): MembersSettings => ({
  areaType: "completo",
  commentsEnabled: true,
  language: "pt",
  antiPiracy: {
    watermark: true,
    blockCopy: true,
    blockPrint: true,
    passwordByEmail: true,
  },
  supportEmail: "",
});

export function useMembersSettings(areaId: string) {
  const [settings, setSettings] = useState<MembersSettings>(() => buildMockSettings());

  useEffect(() => {
    setSettings(buildMockSettings());
  }, [areaId]);

  return { settings, setSettings };
}
