import LoginPage from "@/components/LoginPage/LoginPage";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Login() {
  return (
    <LoginPage
      baseFontClassName={spaceGrotesk.className}
      displayFontClassName={bebasNeue.className}
    />
  );
}
