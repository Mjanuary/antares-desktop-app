import { Button } from "../../../components/ui/button";

export const SimilarInvitation = () => (
  <div className="border-t p-4 pb-8 border-color-theme">
    <h2 className="text-lg mb-3">Similar colors</h2>
    <div className="flex gap-2 flex-wrap">
      {[1243, 1233, 2345, 3545, 6456, 3794].map((el) => (
        <Button
          key={el}
          size="sm"
          className="text-md !bg-gray-400 !bg-opacity-30 hover:!bg-opacity-100 !border-transparent"
        >
          {el}
        </Button>
      ))}
    </div>
  </div>
);
