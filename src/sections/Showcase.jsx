import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

const Showcase = () => {

    const sectionRef = useRef(null)
    const project1ref = useRef(null)
    const project2ref = useRef(null)
    const project3ref = useRef(null)

    
    useGSAP(()=>{
        const projects = [project1ref.current, project2ref.current, project3ref.current]
    
        projects.forEach((card,index)=>{
            gsap.fromTo(card,
                {
                    y:50,
                    opacity:0
                },
                {
                    y:0,
                    opacity:1,
                    duration:1,
                    delay: 0.3 * (index+1),
                    scrollTrigger:{
                        trigger:card,
                        start:'top bottom-=100'
                    }
                }
            )
        })
        
        gsap.fromTo(sectionRef.current, 
            {
                opacity:0,
            },
            {
                opacity:1,
                duration:1.5,
            }
        )
    },[])

  return (
    <section id="work" ref={sectionRef} className="app-showcase">
      <div className="w-full">
        <div className="showcaselayout">
            <div className="first-project-wrapper" ref={project1ref}>
                <div className="image-wrapper">
                    <img src="/images/project1.png" alt="Ryde" />
                </div>
                <div className="text-content">
                    <h2>On Demand Rides Lorem ipsum dolor sit amet consectetur.</h2>
                    <p className="text-white-50 md:text-xl">Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, quia!</p>
                </div>
            </div>
            <div className="project-list-wrapper overflow-hidden">
                <div className="project" ref={project2ref}>
                    <div className="image-wrapper bg-[#ffefdb]">
                        <img src="/images/project2.png" alt="" />
                    </div>
                    <h2>Lorem ipsum dolor sit.</h2>
                </div>
                <div className="project" ref={project3ref}>
                    <div className="image-wrapper bg-[#ffe7eb]">
                        <img src="/images/project3.png" alt="yc" />
                    </div>
                    <h2>Lorem ipsum dolor sit.</h2>
                </div>
            </div>
        </div>
      </div>
    </section>
  )
}

export default Showcase
