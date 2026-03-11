const appIcon = { src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" };

export const Logo = () => {
  return (
    <img
      src={(appIcon as { src: string }).src}
      alt="Midday"
      width={36}
      height={36}
      className="w-9 h-9 rounded-lg"
    />
  );
};
