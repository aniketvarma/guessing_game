# Solana Guessing Game - Front-End dApp

A modern, responsive web interface for the Solana Guessing Game built with Next.js, React, and Solana wallet adapters.

![Welcome Screen](https://github.com/user-attachments/assets/525d6487-c8f1-41e1-85f9-832f29a6d580)

## 🎨 Features

### Core Functionality
- **🔌 Wallet Connection**: Seamless integration with Phantom and Solflare wallets
- **🎮 Create Game**: Set up a new guessing game with a secret number (1-100)
- **🎯 Make Guesses**: Interactive guessing interface with real-time feedback
- **📊 Game Status**: Live display of game state, attempts, and winner information
- **🏆 Winner Display**: Visual celebration when a player guesses correctly
- **💰 Close Game**: Creators can close completed games and reclaim rent

### User Experience
- **📱 Responsive Design**: Mobile-friendly interface that works on all devices
- **🎨 Modern UI**: Gradient backgrounds and glassmorphism effects
- **⚡ Real-time Updates**: Automatic game state refresh after transactions
- **🎯 Visual Feedback**: Color-coded feedback for high/low/correct guesses
- **📝 Guess History**: Track all your previous guesses in a session
- **⏳ Loading States**: Clear indicators for pending transactions
- **❌ Error Handling**: User-friendly error messages

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- A Solana wallet (Phantom or Solflare)
- Local Solana validator running (for development)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules with custom styles
- **Blockchain**: Solana Web3.js + Anchor Framework
- **Wallet Integration**: Solana Wallet Adapter

### Project Structure

```
app/
├── components/
│   ├── WalletContextProvider.tsx  # Wallet connection provider
│   ├── CreateGame.tsx              # Game creation form
│   ├── MakeGuess.tsx               # Guessing interface
│   └── GameStatus.tsx              # Game state display
├── hooks/
│   └── useGuessingGame.ts          # Custom hook for program interaction
├── globals.css                     # Global styles
├── layout.tsx                      # Root layout
└── page.tsx                        # Main page component
```

## 🎮 How to Use

### 1. Connect Your Wallet

![Wallet Modal](https://github.com/user-attachments/assets/03c64878-9bdb-44c1-8222-3363c2ac854b)

Click the "Select Wallet" button in the top right and choose your preferred wallet (Phantom or Solflare).

### 2. Create a Game

Once connected, you'll see the game interface:
- Enter a secret number between 1 and 100
- Click "Create Game" to initialize your game on-chain
- Share your wallet address with other players

### 3. Make Guesses

To guess another player's game:
- Enter the creator's wallet address
- Enter your guess (1-100)
- Submit and receive instant feedback:
  - 🟢 **Green**: Correct guess! You win!
  - 🔴 **Red**: Too high, try lower
  - 🟡 **Yellow**: Too low, try higher

### 4. Track Your Game

The Game Status panel shows:
- Current game state (Active/Completed)
- Number of attempts made
- Your secret number (if you're the creator)
- Winner information (when game is completed)

### 5. Close Game

As a creator, once your game is completed (someone guessed correctly):
- Click "Close Game & Reclaim Rent"
- This deletes the game account and refunds the rent to you

## 🔧 Configuration

### Network Configuration

By default, the dApp connects to `localhost:8899` (local validator). To change networks, edit `app/components/WalletContextProvider.tsx`:

```typescript
// For devnet
const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

// For mainnet-beta
const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
```

### Program ID

The program ID is configured in `app/hooks/useGuessingGame.ts`:

```typescript
const PROGRAM_ID = new PublicKey('CgmYL5KARiCGFXP1bpWh8xuX9B2anwoW3Ygj4GTScRud');
```

Make sure this matches your deployed program address.

## 🎨 Customization

### Styling

All styles are in `app/globals.css`. Key CSS variables:

```css
:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 20, 20, 40;
  --background-end-rgb: 10, 10, 20;
}
```

### Color Scheme
- **Primary Gradient**: Purple to Green (`#9945ff` to `#14f195`)
- **Background**: Dark gradient for depth
- **Cards**: Glassmorphism with backdrop blur

## 🔐 Security

- All transactions require wallet signature approval
- Creator cannot guess their own game (enforced by smart contract)
- Only creators can close their games
- PDA ensures one game per wallet
- Input validation for all user inputs

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure you have Phantom or Solflare installed
- Check that you're on the correct network
- Refresh the page and try again

### Transaction Fails
- Make sure you have enough SOL for transaction fees
- Verify the local validator is running
- Check that the program is deployed correctly

### Game State Not Updating
- Wait a few seconds for blockchain confirmation
- Refresh the page to fetch latest state
- Check browser console for any errors

## 📦 Dependencies

### Core Dependencies
- `next`: ^16.0.1
- `react`: ^19.2.0
- `@solana/web3.js`: ^1.98.4
- `@coral-xyz/anchor`: ^0.32.1

### Wallet Adapters
- `@solana/wallet-adapter-react`: ^0.15.39
- `@solana/wallet-adapter-react-ui`: ^0.9.39
- `@solana/wallet-adapter-wallets`: ^0.19.37

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables if needed
4. Deploy!

### Environment Variables

No environment variables are required by default. If you want to configure the RPC endpoint:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 📄 License

ISC License - See root LICENSE file

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- GitHub: [@aniketvarma](https://github.com/aniketvarma)
- Repository: [guessing_game](https://github.com/aniketvarma/guessing_game)

---

**Built with ❤️ using Next.js, React, and Solana**
