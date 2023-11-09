import { Command } from "@models/command";
import {
  CommandInteraction,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";

export class CommandCollection {
  private static commandsMap = new Map<string, Command>();

  static use(command: Command) {
    this.commandsMap.set(command.json.name, command);
  }
  static handle(interaction: CommandInteraction) {
    try {
      this.commandsMap.get(interaction.commandName)?.handler(interaction);
    } catch (error) {
      if (!interaction.replied) {
        interaction.reply("Internal server error");
      }
    }
  }
  static async register(token: string, clientId: string, guildId: string) {
    const commands: Array<RESTPostAPIApplicationCommandsJSONBody> = [];
    this.commandsMap.forEach((c) => {
      commands.push(c.json);
    });

    if (commands.length === 0) {
      throw new Error("no commands to register to guild.");
    }

    const rest = new REST().setToken(token);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  }
}
