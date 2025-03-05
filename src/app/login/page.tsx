import { Header } from '@/app/components/Header/Header';
import { LogIn } from '@/app/components/LogIn/LogIn';

export default function LoginPage() {
	return (
		<>
			<Header showButtons={false} />
			<LogIn />
		</>
	)
}