import { QuestionType, Option } from "@/types/question-types";

export function generateNextQuestion(
  step: number,
  history: any[],
  userInput: string
): QuestionType {
  // --- SAMPLE QUESTIONS ---
  const questions: QuestionType[] = [
    {
      step: 1,
      question:
        "Which type of business model aligns better with your long-term lifestyle and energy levels?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "Calmer, predictable, low-pressure work style.",
          pros: ["Low stress", "Predictable workflow", "Easy to manage solo"],
          cons: ["Lower income ceiling", "Slower scaling"],
          example:
            "Subscription-based digital service or small recurring-income model.",
        },
        {
          key: "B",
          label: "Option B",
          summary: "Higher performance, more income potential.",
          pros: ["High upside", "Fast growth potential", "Exciting & dynamic"],
          cons: ["Higher stress", "More time required"],
          example:
            "Marketing agency, arbitrage model, or offer creation business.",
        },
      ],
    },

    {
      step: 2,
      question:
        "What do you value more when running your business: time freedom or higher income upside?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "More freedom, less pressure, stable routine.",
          pros: ["Flexible schedule", "Low burnout", "Work-life balance"],
          cons: ["Less total income", "Slower business growth"],
          example:
            "Freelancing, consulting, done-for-you service with limited clients.",
        },
        {
          key: "B",
          label: "Option B",
          summary: "Higher income potential even if it requires more effort.",
          pros: ["Higher revenue ceiling", "More opportunities"],
          cons: ["Longer hours", "More responsibilities"],
          example:
            "Multi-client agency, scalable online business, or SaaS micro-product.",
        },
      ],
    },

    {
      step: 3,
      question:
        "Which environment makes you perform better: structure or flexibility?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "Clear structure, predictable systems, routine work.",
          pros: ["Focus", "Stability", "Less chaos"],
          cons: ["Less spontaneity"],
          example: "Content batching, service retainers, scheduled workflow.",
        },
        {
          key: "B",
          label: "Option B",
          summary: "Dynamic work, flexible tasks, fast changes.",
          pros: ["Variety", "Creativity", "Adaptability"],
          cons: ["Harder to stay consistent"],
          example: "Creative freelancing, project-based work, dynamic agencies.",
        },
      ],
    },

    {
      step: 4,
      question: "Do you prefer working alone or collaborating with others?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "You love independent work and minimal communication.",
          pros: ["No meetings", "Autonomy"],
          cons: ["Limited scale"],
          example: "Solo digital creator, micro-SaaS, niche websites.",
        },
        {
          key: "B",
          label: "Option B",
          summary:
            "You enjoy teamwork, cooperation, or leading and managing others.",
          pros: ["Bigger potential", "Shared workload"],
          cons: ["More complexity"],
          example: "Agency teamwork, partnerships, operational roles.",
        },
      ],
    },

    {
      step: 5,
      question:
        "How much startup capital are you realistically willing to invest?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "Minimal cost, lean startup.",
          pros: ["Very low risk", "Easy to start"],
          cons: ["Slower to scale"],
          example: "Content creation, digital products, freelancing.",
        },
        {
          key: "B",
          label: "Option B",
          summary: "Comfortable investing moderately for faster results.",
          pros: ["Quicker scaling", "Better tools"],
          cons: ["More upfront risk"],
          example: "E-commerce, niche brand building, advertising-driven models.",
        },
      ],
    },

    {
      step: 6,
      question:
        "What motivates you more: stability and certainty or big ambition and growth?",
      options: [
        {
          key: "A",
          label: "Option A",
          summary: "Stability, slower sustainable growth.",
          pros: ["Peace of mind", "Consistency"],
          cons: ["Lower ceiling"],
          example: "Recurring service model or niche content business.",
        },
        {
          key: "B",
          label: "Option B",
          summary: "Ambition, rapid expansion, higher rewards.",
          pros: ["Fast progress", "More impact"],
          cons: ["More stress"],
          example:
            "Scaling agency, online brand, or high-growth digital product.",
        },
      ],
    },
  ];

  // Return the right question based on the step
  return questions[step - 1];
}
