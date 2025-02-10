
import { Card } from "@/components/ui/card";

interface ResourceCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const ResourceCard = ({ title, description, imageUrl }: ResourceCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Card>
  );
};

export default ResourceCard;
