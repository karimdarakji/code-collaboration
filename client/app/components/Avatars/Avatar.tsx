import Image from "next/image";

interface AvatarProps {
  imagePath: string;
  alt: string;
}
const Avatar = ({ imagePath, alt }: AvatarProps) => {
    console.log(imagePath)
  return (
    <Image
      src={imagePath}
      alt={alt}
      width="50"
      height="50"
      className="w-8 h-8 rounded-full border-2 border-white -ml-2"
    />
  );
};

export default Avatar;
