import Wrapper from "@/components/global/wrapper";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Analysis from "@/components/marketing/analysis";
import Companies from "@/components/marketing/companies";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import LanguageSupport from "@/components/marketing/lang-support";
import Pricing from "@/components/pricing";
import { api } from "@/lib/polar";

const HomePage = async () => {
  const products = await api.products.list({ isArchived: false });

  console.log(products);

  return (
    <Wrapper className="py-20 relative">
      <Hero />
      <Companies />
      {/* {products.result.items.map((item, i) => (
        <div key={item.id}>{item.id}</div>
      ))} */}
      <Features />
      <Analysis />
      <Integration />
      <Pricing />
      <LanguageSupport />
      <CTA />
    </Wrapper>
  );
};

export default HomePage;
