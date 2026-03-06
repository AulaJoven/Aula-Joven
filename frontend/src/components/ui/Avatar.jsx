export const Avatar = ({ nombre, apellidos, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sz} rounded-full bg-[#7BAFD4] flex items-center justify-center font-bold text-white shrink-0`}>
      {`${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()}
    </div>
  );
};