export type MembersAreaType = "lite" | "completo";

export type MembersLanguage = "pt" | "en";

export type MembersSettings = {
  areaType: MembersAreaType;
  commentsEnabled: boolean;
  language: MembersLanguage;
  antiPiracy: {
    watermark: boolean;
    blockCopy: boolean;
    blockPrint: boolean;
    passwordByEmail: boolean;
  };
  supportEmail: string;
};

