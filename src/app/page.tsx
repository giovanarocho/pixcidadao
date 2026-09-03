import HomeClient from "@/components/HomeClient";
import { getSiteContent } from "@/lib/ebook/getContent";

// Nunca deixar essa página "engessada" no conteúdo de quando foi feito o
// deploy — o texto (e o preço) podem ter sido editados depois em
// /admin/site, e essa edição precisa aparecer sem precisar de novo deploy.
export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getSiteContent();
  return <HomeClient content={content} />;
}
