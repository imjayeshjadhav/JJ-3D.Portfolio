import Navbar from "./components/Navbar"
import ExperienceSection from "./sections/ExperienceSection"
import FeatureCard from "./sections/FeatureCard"
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
    </>
  )
}

export default App
