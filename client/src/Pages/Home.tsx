
import Banner from "../Components/Banner";
import Hero from "../Components/Home/Hero";
import Features from "../Components/Home/Features";
import HomeCategory from "../Components/Home/HomeCategory";
import PopularProducts from "../Components/Home/PopularProducts";
import PowerTools from "../Components/Home/PowerTools";
import CCTVSurveillanceSolutions from "../Components/Home/CCTVSurveillanceSolutions";
import SpecialCables from "../Components/Home/SpecialCables";
import BahraElectricProducts from "../Components/Home/BahraElectricProducts";
import PhilipsLightingSolutions from "../Components/Home/PhilipsLightingSolutions";
import ProductCategories from "../Components/Home/ProductCategories";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Banner />
      <Hero />
      <Features />
      <HomeCategory />
      <PopularProducts />
      <ProductCategories />
      <SpecialCables />
      <BahraElectricProducts />
      <PhilipsLightingSolutions />
      <PowerTools />
      <CCTVSurveillanceSolutions />
    </div>
  );
};

export default Home;
