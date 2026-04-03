# Text-to-Image App

React + Vite app that generates images with Hugging Face.

## Setup

1. Install dependencies.
2. Create your local env file from the example:
	- copy `.env.example` to `.env`
3. Set your key in `.env`:
	- `VITE_HF_TOKEN=your_huggingface_token_here`
4. Start dev server.

## Security / GitHub push notes

- `.env` is ignored by git.
- `.env.example` is committed so others know required variables.
- Never commit real API keys.

If a key was previously committed, rotate/revoke it in your provider dashboard before pushing.
