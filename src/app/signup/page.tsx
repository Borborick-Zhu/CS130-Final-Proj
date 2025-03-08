import { Header } from '@/app/components/Header/Header';
import { SignUp } from '../components/SignUp/SignUp';

export default function LoginPage() {
	return (
		<>
			<Header showButtons={false} />
			<SignUp />
		</>
	)
}