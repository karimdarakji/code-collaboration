interface AvatarProps {
  imagePath: string;
  alt: string;
}
const Avatar = ({ imagePath, alt }: AvatarProps) => {
  return (
    <img
      src={imagePath}
      alt={alt}
      className="w-8 h-8 rounded-full border-2 border-white -ml-2"
    />
  );
};

export default Avatar;
