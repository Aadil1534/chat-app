export default function MessageBubble({ message, isOutgoing }) {
  const { text, imageUrl, createdAt, senderId } = message;
  const time = createdAt?.toDate?.()
    ? createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div
        className={`max-w-[70%] flex flex-col ${
          isOutgoing ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOutgoing
              ? 'bg-[#6C3EF4] text-white rounded-br-md'
              : 'bg-[#e9ecef] text-gray-800 rounded-bl-md'
          }`}
          style={{ borderRadius: '16px' }}
        >
          {imageUrl && (
            <div className="mb-2">
              <img
                src={imageUrl}
                alt="Shared"
                className="max-w-full max-h-64 rounded-xl object-cover"
                style={{ borderRadius: '12px' }}
              />
            </div>
          )}
          {text && <p className="text-sm break-words">{text}</p>}
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 ${
            isOutgoing ? 'mr-1' : 'ml-1'
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
