import { Header } from '../components/Header/Header';
import { DeckGrid } from '../components/DeckGrid/DeckGrid';
export default function DashboardPage() {
  return (
    <>
      <Header showButtons={false} />
      <DeckGrid />
    </>
  );
}