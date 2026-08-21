import { createFileRoute } from "@tanstack/react-router";
import { DeskPet } from "@/components/pet/desk-pet";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DeskPet />;
}
