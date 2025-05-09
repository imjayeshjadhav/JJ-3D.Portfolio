import Navbar from "./components/Navbar"
import ExperienceSection from "./sections/ExperienceSection"
import FeatureCard from "./sections/FeatureCard"
import Hero from "./sections/Hero"
import Showcase from "./sections/Showcase"

const App = () => {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Showcase/>
      {/* <LogoSection/> */}
      <FeatureCard/>
      <ExperienceSection/>
    </>
  )
}

export default App
