const navLinks = [
    {
      name: "Work",
      link: "#work",
    },
    {
      name: "Involvements",
      link: "#experience",
    },
    {
      name: "Skills",
      link: "#skills",
    },
  ];
  
  const words = [
    { text: "Ideas", imgPath: "/images/ideas.svg" },
    { text: "Concepts", imgPath: "/images/concepts.svg" },
    { text: "Designs", imgPath: "/images/designs.svg" },
    { text: "Code", imgPath: "/images/code.svg" },
    { text: "Ideas", imgPath: "/images/ideas.svg" },
    { text: "Concepts", imgPath: "/images/concepts.svg" },
    { text: "Designs", imgPath: "/images/designs.svg" },
    { text: "Code", imgPath: "/images/code.svg" },
  ];
  
  const counterItems = [
    { value: 10, suffix: "+", label: "Projects Completed" },
    { value: 20, suffix: "+", label: "Technologies Learned" },
    { value: 130, suffix: "+", label: "GitHub Contributions" },
    { value: 95, suffix: "%", label: "Learning Consistency" },
  ];  
  
  const logoIconsList = [
    {
      imgPath: "/images/logos/company-logo-1.png",
    },
    {
      imgPath: "/images/logos/company-logo-2.png",
    },
    {
      imgPath: "/images/logos/company-logo-3.png",
    },
    {
      imgPath: "/images/logos/company-logo-4.png",
    },
    {
      imgPath: "/images/logos/company-logo-5.png",
    },
    {
      imgPath: "/images/logos/company-logo-6.png",
    },
    {
      imgPath: "/images/logos/company-logo-7.png",
    },
    {
      imgPath: "/images/logos/company-logo-8.png",
    },
    {
      imgPath: "/images/logos/company-logo-9.png",
    },
    {
      imgPath: "/images/logos/company-logo-10.png",
    },
    {
      imgPath: "/images/logos/company-logo-11.png",
    },
  ];
  
const abilities = [
  {
    imgPath: "/images/seo.png",
    title: "Quick Learner",
    desc: "Adapting swiftly to new technologies and concepts with a strong desire to grow.",
  },
  {
    imgPath: "/images/chat.png",
    title: "Collaborative Team Player",
    desc: "Communicating effectively and working well in team-based academic and project settings.",
  },
  {
    imgPath: "/images/time.png",
    title: "Consistent & Punctual",
    desc: "Managing time efficiently and meeting deadlines in academic and personal projects.",
  },
];
  
  const techStackImgs = [
    {
      name: "React Developer",
      imgPath: "/images/logos/react.png",
    },
    {
      name: "Python Developer",
      imgPath: "/images/logos/python.svg",
    },
    {
      name: "Backend Developer",
      imgPath: "/images/logos/node.png",
    },
    {
      name: "Interactive Developer",
      imgPath: "/images/logos/three.png",
    },
    {
      name: "Project Manager",
      imgPath: "/images/logos/git.svg",
    },
  ];
  
  const techStackIcons = [
    {
      name: "React Developer",
      modelPath: "/models/react_logo-transformed.glb",
      scale: 1,
      rotation: [0, 0, 0],
    },
    {
      name: "Java Developer",
      modelPath: "/models/java.glb",
      scale: 1.5,
      rotation: [0, 0, 0],
    },
    {
      name: "Backend Developer",
      modelPath: "/models/node-transformed.glb",
      scale: 5,
      rotation: [0, -Math.PI / 2, 0],
    },
    {
      name: "Competitive Programmer",
      modelPath: "/models/c.glb",
      scale: 0.08,
      rotation: [0, 0, 0],
    },
    {
      name: "Project Manager",
      modelPath: "/models/git-svg-transformed.glb",
      scale: 0.05,
      rotation: [0, -Math.PI / 4, 0],
    },
  ];
  
const expCards = [
  {
    review:
      "Demonstrated strong self-motivation by independently learning modern web technologies and deploying real-world projects with version control best practices.",
    imgPath: "/images/exp1.png",
    logoPath: "/images/logo1.png",
    title: "Self-Learning Web Projects",
    date: "December 2024 - Present",
    responsibilities: [
      "Created and deployed responsive web apps using React, Next.js and modern javascript technologies.",
      "Integrated Appwrite, Gemini API, Vapi Voice AI, and Google Cloud Auth into projects.",
      "Maintained a clean GitHub profile showcasing commits, issues, and deployed links.",
    ],
  },
  {
    review:
      "Known for being punctual and dependable when it comes to academic projects, always delivering work on time with attention to both frontend and backend development.",
    imgPath: "/images/exp2.png",
    logoPath: "/images/logo2.png",
    title: "Academic Projects",
    date: "September 2024 - Present",
    responsibilities: [
      "Ensured all assigned deliverables were submitted well before deadlines.",
      "Implemented academic projects using Java Swing for the frontend and MySQL for the backend, along with various other full-stack tools and frameworks.",
      "Collaborated with peers on UI planning, backend logic, and project documentation.",
      "Focused on writing clean, readable code and building responsive user interfaces.",
    ],
  },
  {
    review:
      "Contributed actively to college-level coding clubs and participated in various technical events, gaining hands-on experience and improving collaboration skills.",
    imgPath: "/images/exp3.png",
    logoPath: "/images/logo3.png",
    title: "Tech Club Member (Marketing Head)",
    date: "August 2023 - Present",
    responsibilities: [
      "Participated in hackathons and coding competitions organized by the club.",
      "Helped organize workshops and peer-to-peer learning sessions on Git, Web Dev, and DSA.",
      "Worked on mini-projects and coding challenges with fellow members.",
    ],
  },
];

  
  const expLogos = [
    {
      name: "logo1",
      imgPath: "/images/logo1.png",
    },
    {
      name: "logo2",
      imgPath: "/images/logo2.png",
    },
    {
      name: "logo3",
      imgPath: "/images/logo3.png",
    },
  ];
  
  const testimonials = [
    {
      name: "Esther Howard",
      mentions: "@estherhoward",
      review:
        "I can’t say enough good things about Adrian. He was able to take our complex project requirements and turn them into a seamless, functional website. His problem-solving abilities are outstanding.",
      imgPath: "/images/client1.png",
    },
    {
      name: "Wade Warren",
      mentions: "@wadewarren",
      review:
        "Working with Adrian was a fantastic experience. He transformed our outdated website into a modern, user-friendly platform. His attention to detail and commitment to quality are unmatched. Highly recommend him for any web dev projects.",
      imgPath: "/images/client3.png",
    },
    {
      name: "Guy Hawkins",
      mentions: "@guyhawkins",
      review:
        "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
      imgPath: "/images/client2.png",
    },
    {
      name: "Marvin McKinney",
      mentions: "@marvinmckinney",
      review:
        "Adrian was a pleasure to work with. He turned our outdated website into a fresh, intuitive platform that’s both modern and easy to navigate. Fantastic work overall.",
      imgPath: "/images/client5.png",
    },
    {
      name: "Floyd Miles",
      mentions: "@floydmiles",
      review:
        "Adrian’s expertise in web development is truly impressive. He delivered a robust and scalable solution for our e-commerce site, and our online sales have significantly increased since the launch. He’s a true professional!",
      imgPath: "/images/client4.png",
    },
    {
      name: "Albert Flores",
      mentions: "@albertflores",
      review:
        "Adrian was a pleasure to work with. He understood our requirements perfectly and delivered a website that exceeded our expectations. His skills in both frontend and backend dev are top-notch.",
      imgPath: "/images/client6.png",
    },
  ];
  
  const socialImgs = [
    {
      name: "insta",
      imgPath: "/images/insta.png",
      link: "instagram.com/jjayeshhz"
    },
    {
      name: "Github",
      imgPath: "/images/fb.png",
      link:"github.com/imjayeshjadhav"
    },
    {
      name: "x",
      imgPath: "/images/x.png",
      link:"x.com/jjayeshhz"
    },
    {
      name: "linkedin",
      imgPath: "/images/linkedin.png",
      link :"/"
    },
  ];
  
  export {
    words,
    abilities,
    logoIconsList,
    counterItems,
    expCards,
    expLogos,
    testimonials,
    socialImgs,
    techStackIcons,
    techStackImgs,
    navLinks,
  };