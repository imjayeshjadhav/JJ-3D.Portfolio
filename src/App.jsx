import Navbar from "./components/Navbar"
import Contact from "./sections/Contact"
import ExperienceSection from "./sections/ExperienceSection"
import FeatureCard from "./sections/FeatureCard"
import Footer from "./sections/Footer"
import Hero from "./sections/Hero"
import Showcase from "./sections/Showcase"
import TechStack from "./sections/TechStack"

const App = () => {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Showcase/>
      {/* <LogoSection/> */}
      <FeatureCard/>
      <ExperienceSection/>
      <TechStack/>
      <Contact/>
      <Footer/>
    </>
  )
}

export default App
