import { MinecraftApplicationModel } from "@models/application";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  Message,
  MessageCreateOptions,
  SelectMenuBuilder,
  StringSelectMenuBuilder,
  User,
} from "discord.js";
import {
  MinecraftAutoReviewResult,
  MinecraftApplicationAutoReviewStatus,
} from "@controllers/applications/minecraft/minecraft-auto-review";
export enum MinecraftApplicationDecisionEvent {
  Accept = "minecraft-application-decision-accept",
  Reject = "minecraft-application-decision-reject",
}

const MinecraftApplicationDecisionEmbed = (
  minecraftApplication: MinecraftApplicationModel,
  autoReviewResult: MinecraftAutoReviewResult,
  reviewer?: User,
) => {
  const {
    reason,
    discordId,
    minecraftName,
    minecraftUuid,
    age,
    minecraftSkinSum,
  } = minecraftApplication;
  let color: ColorResolvable = Colors.Blurple;

  switch (autoReviewResult.status) {
    case MinecraftApplicationAutoReviewStatus.Accepted:
      color = Colors.Green;
      break;
    case MinecraftApplicationAutoReviewStatus.Rejected:
      color = Colors.Red;
      break;
    case MinecraftApplicationAutoReviewStatus.NeedsManualReview:
      color = Colors.Yellow;
      break;
  }

  const embed = new EmbedBuilder()
    .setTitle("Whitelist Application")
    .setDescription(reason)
    .addFields([
      {
        name: "discordId",
        value: discordId,
      },
      {
        name: "discord",
        value: `<@${discordId}>`,
      },
      {
        name: "age",
        value: age,
      },
      {
        name: "minecraftName",
        value: minecraftName,
      },
      {
        name: "minecraftUuid",
        value: minecraftUuid,
      },
      {
        name: "minecraftSkinSum",
        value: minecraftSkinSum,
      },
      {
        name: "autoReviewComment",
        value: autoReviewResult.reason,
      },
    ])
    .setColor(color);
  const thumbnail = new URL(`https://mc-heads.net/body/${minecraftName}.png`);
  const image = new URL(`https://mc-heads.net/body/${minecraftName}.png`);
  embed.setImage(image.toString());
  embed.setThumbnail(thumbnail.toString());
  if (reviewer) {
    embed.addFields([
      {
        name: "reviewer",
        value: `<@${reviewer.id}>`,
      },
    ]);
  }
  return embed;
};

export type MinecraftApplicationRejectReason =
  | "underage"
  | "no_reason_provided"
  | "low_effort_application"
  | "offensive_name"
  | "offensive_skin"
  | "offensive_username"
  | "offensive_discord_user"
  | "offensive_application"
  | "user_not_in_discord_server"
  | "no_minecraft_account"
  | "other_bannable"
  | "invalid_age"
  | "other";

export const minecraftApplicationDenyReasonDescriptions = new Map<
  MinecraftApplicationRejectReason,
  string
>();

export const minecraftApplicationDenyReasons: Array<{
  label: string;
  value: MinecraftApplicationRejectReason;
}> = [
  {
    label: "underage (< 13)",
    value: "underage",
  },
  {
    label: "no reason provided",
    value: "no_reason_provided",
  },
  {
    label: "Low effort application",
    value: "low_effort_application",
  },
  {
    label: "offensive name",
    value: "offensive_name",
  },
  {
    label: "offensive skin",
    value: "offensive_skin",
  },
  {
    label: "offensive username",
    value: "offensive_username",
  },
  {
    label: "offensive discord avatar/username/status/bio",
    value: "offensive_discord_user",
  },
  {
    label: "offensive application",
    value: "offensive_application",
  },
  {
    label: "user not in discord server",
    value: "user_not_in_discord_server",
  },
  {
    label: "minecraft account not found",
    value: "no_minecraft_account",
  },
  {
    label: "other",
    value: "other",
  },
  {
    label: "other (bannable)",
    value: "other_bannable",
  },
  {
    label: "invalid age",
    value: "invalid_age",
  },
];

minecraftApplicationDenyReasons.forEach((v) => {
  minecraftApplicationDenyReasonDescriptions.set(v.value, v.label);
});

export const MinecraftApplicationDecisionMessageOptions = (
  application: MinecraftApplicationModel,
  autoReviewResult: MinecraftAutoReviewResult,
  reviewer?: User,
) => {
  const opts: MessageCreateOptions = {
    embeds: [
      MinecraftApplicationDecisionEmbed(
        application,
        autoReviewResult,
        reviewer,
      ),
    ],
  };
  opts.components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(MinecraftApplicationDecisionEvent.Accept)
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(MinecraftApplicationDecisionEvent.Reject)
        .addOptions(minecraftApplicationDenyReasons)
        .setPlaceholder("Reject with reason"),
    ),
  ];
  return opts;
};

export const ParseMinecraftApplicationDecisionMessage = (
  message: Message,
): MinecraftApplicationModel => {
  if (message.embeds.length < 1) {
    throw new Error("error parsing application decision message");
  }
  const embed = message.embeds[0];
  const reason = embed.description;

  let discordId: string | undefined;
  let minecraftUuid: string | undefined;
  let minecraftName: string | undefined;
  let minecraftSkinSum: string | undefined;
  let age: string | undefined;

  embed.fields.forEach((field) => {
    if (field.name === "discordId") discordId = field.value;
    if (field.name === "minecraftUuid") minecraftUuid = field.value;
    if (field.name === "minecraftName") minecraftName = field.value;
    if (field.name === "age") age = field.value;
    if (field.name === "minecraftSkinSum") minecraftSkinSum = field.value;
  });

  if (
    !discordId ||
    !minecraftUuid ||
    !minecraftName ||
    !reason ||
    !age ||
    !minecraftSkinSum
  ) {
    throw new Error("embed missing fields.");
  }

  return {
    age,
    discordId,
    minecraftUuid,
    minecraftName,
    minecraftSkinSum,
    reason,
  };
};
