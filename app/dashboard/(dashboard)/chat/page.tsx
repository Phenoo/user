"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WorkingOnIt() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="text-6xl animate-bounce">🔨</div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Working on It</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page is under construction. We're building something amazing for
          you!
        </p>

        <Link href="/dashboard">
          <Button className="w-full">Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

// interface Recipe {
//   name: string;
//   ingredients: string[];
//   instructions: string[];
//   servings: number;
//   prepTime: number;
// }

// export default function StructuredOutput() {
//   const [prompt, setPrompt] = useState("");
//   const [recipe, setRecipe] = useState<Recipe | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) return;

//     setLoading(true);
//     try {
//       const response = await fetch("/api/structured-output", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//       });

//       const data = await response.json();
//       setRecipe(data.recipe);
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-background py-12">
//       <div className="container mx-auto px-4 max-w-2xl">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">Structured Output</h1>
//           <p className="text-muted-foreground">
//             Generate structured data with AI
//           </p>
//         </div>

//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Generate Recipe</CardTitle>
//             <CardDescription>
//               Describe a recipe and get structured data
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Recipe Description</label>
//               <Input
//                 placeholder="e.g., A simple chocolate cake recipe..."
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
//               />
//             </div>

//             <Button
//               onClick={handleGenerate}
//               disabled={loading}
//               className="w-full"
//             >
//               {loading ? "Generating..." : "Generate Recipe"}
//             </Button>
//           </CardContent>
//         </Card>

//         {recipe && (
//           <Card>
//             <CardHeader>
//               <CardTitle>{recipe.name}</CardTitle>
//               <CardDescription>
//                 {recipe.servings} servings • {recipe.prepTime} min prep
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div>
//                 <h3 className="font-semibold mb-2">Ingredients</h3>
//                 <ul className="list-disc list-inside space-y-1">
//                   {recipe.ingredients.map((ingredient, idx) => (
//                     <li key={idx} className="text-foreground">
//                       {ingredient}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h3 className="font-semibold mb-2">Instructions</h3>
//                 <ol className="list-decimal list-inside space-y-2">
//                   {recipe.instructions.map((instruction, idx) => (
//                     <li key={idx} className="text-foreground">
//                       {instruction}
//                     </li>
//                   ))}
//                 </ol>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </main>
//   );
// }

// import React from "react";
// import ChatContainer from "./_components/ChatContainer";

// const ChatPage = () => {
//   return (
//     <div className="max-w-7xl mx-auto w-full">
//       <ChatContainer />;
//     </div>
//   );
// };

// export default ChatPage;
