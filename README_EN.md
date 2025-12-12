![AI Werewolf Village Header](https://raw.githubusercontent.com/Sunwood-ai-labs/image-box/refs/heads/main/AI-Werewolf-Village_header.png)

# 🌕 AI Werewolf Village

[![Japanese](https://img.shields.io/badge/lang-日本語-red.svg)](README.md)

An autonomous "Werewolf" (Mafia) game simulator powered by Gemini 2.5 Flash.
Unique AI agents play as Villagers or Werewolves, engaging in debates, deductions, and deception to win the game.


![Game Screenshot](https://github.com/user-attachments/assets/8075124d-6bbe-49db-8dc5-302eba34af6e)

## ✨ Features

*   **Multi-Agent Simulation**: All players are controlled by LLMs, each acting with unique personalities (logical, emotional, paranoid, etc.) and memory.
*   **Powered by Gemini 2.5 Flash**: Utilizes Google's latest model for high-speed, near real-time discussions.
*   **Multi-Language Support (New!)**: Real-time switching between "Japanese" and "English" for both UI and AI discussions.
*   **OpenRouter Support**: Switch to other models like Claude 3.5 Sonnet or GPT-4o via settings to enjoy different agent behaviors.
*   **Fully Autonomous GM**: The Game Master (GM) strictly manages phases (Day, Vote, Night), vote tallying, and win conditions.
*   **XML Structured Output**: Uses XML templates for AI output control, ensuring stable game progression with minimal errors.
*   **God Mode**: As a spectator, you can enable "God Mode" to see everyone's hidden roles and secret conversations.

## 🚀 How to Play

1.  **Prepare API Key**:
    *   This app uses `process.env.API_KEY` (Gemini) or `process.env.OPENROUTER_API_KEY`.
2.  **Start Game**:
    *   Click the "Start Game" button in the top left. Roles will be assigned randomly.
3.  **Progression**:
    *   **Next Step**: Click to advance one action or speech at a time.
    *   **Auto Play**: Toggle "Auto Play" to let the game proceed automatically at your set speed.
4.  **Settings**:
    *   **Language Switch**: Toggle between "JP" and "EN" anytime via the header button.
    *   **Discussion Length**: Adjust how many rounds of discussion occur per day (default: 3) via the slider.
    *   **Speed**: Adjust the auto-play speed.
    *   **Model Change**: Change the AI model used for agents from the settings menu.

## 🧩 Roles

The default is a **5-player village**, but you can adjust counts in the settings.

| Icon | Role | Team | Ability |
| :---: | :--- | :--- | :--- |
| 🐺 | **Werewolf** | Werewolf | Attacks one player at night to eliminate them. |
| 🔮 | **Seer** | Villager | Divines one player at night to know if they are Human or Werewolf. |
| 🛡️ | **Bodyguard** | Villager | Protects one player at night from Werewolf attacks. |
| 🧑‍🌾 | **Villager** | Villager | No special ability. Deduce who the wolves are during discussions. |

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Architecture**: Custom Hook Based State Machine (`useGameMaster`)

## 📝 License

MIT License