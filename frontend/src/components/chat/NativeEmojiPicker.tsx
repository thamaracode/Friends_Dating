import { useMemo, useState } from 'react';

const EMOJI_GROUPS = [
  { name: 'Smileys', items: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','🥹','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤗','🤭','🫢','🤫','🤔','🫡','😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','😴','🥱','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵‍💫','🤯','🥳','😎','🤓','🧐','😕','🫤','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😢','😭','😱','😖','😣','😞','😓','😩','😫','😤','😡','🤬'] },
  { name: 'Gestures', items: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','💪','🦾','🖕','🫂'] },
  { name: 'Hearts', items: ['❤️','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','❣️','💌','💋','💯','✨','💫','⭐','🌟','🔥','🎉','🎊','🥰','😍','😘','😻'] },
  { name: 'Animals', items: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐌','🐞','🐢','🐍','🦖','🐙','🦀','🐬','🐳','🦈','🐊','🦭','🐈','🐕','🦮','🐇','🦔','🐿️'] },
  { name: 'Food', items: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🍞','🥐','🥨','🧀','🥚','🍳','🥞','🧇','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥗','🍜','🍣','🍱','🍦','🍰','🧁','🍩','🍪','☕','🧋','🍵','🥤','🍷','🍺','🥂'] },
  { name: 'Activities', items: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥊','🥋','⛳','🎯','🎮','🕹️','🎲','🎰','🧩','🎨','🎤','🎧','🎼','🎹','🥁','🎷','🎸','🎻','🎬','📷','📸','🎥','🚲','🛹','🏄','🏕️','🏖️','🧘','🏋️'] },
  { name: 'Travel', items: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚲','🛵','🏍️','✈️','🛫','🛬','🚀','🛸','🚁','🚂','🚆','🚇','🚢','⛵','🛳️','⚓','🗺️','🧭','🏠','🏡','🏙️','🌇','🌃','🏖️','🏝️','🏔️','⛺','🌋','🌈','☀️','🌙','⭐','🌧️','❄️'] },
  { name: 'Symbols', items: ['❤️','💔','✅','☑️','❌','❎','➕','➖','➗','❓','❗','‼️','⁉️','💬','💭','🗯️','🔔','🔕','🎵','🎶','🔒','🔓','🔑','💡','📌','📍','🔍','🔎','⚠️','♻️','♾️','💤','💢','💥','💦','💨','🕊️','☮️','✝️','☯️'] }
];

const GROUP_SEARCH_TERMS: Record<string, string> = {
  Smileys: 'face happy smile sad laugh cry reaction',
  Gestures: 'hand hands thumbs up down waving hug thanks',
  Hearts: 'heart love romance affection kiss',
  Animals: 'animal pet cat dog bird fish bug',
  Food: 'food fruit drink coffee meal dessert',
  Activities: 'sport game music art hobby',
  Travel: 'travel car plane place weather nature',
  Symbols: 'symbol check yes no question warning chat'
};

interface NativeEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

export function NativeEmojiPicker({ onSelectEmoji }: NativeEmojiPickerProps) {
  const [activeGroup, setActiveGroup] = useState('Smileys');
  const [query, setQuery] = useState('');
  const group = EMOJI_GROUPS.find((item) => item.name === activeGroup) ?? EMOJI_GROUPS[0];
  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [group];
    return EMOJI_GROUPS.filter((item) => `${item.name} ${GROUP_SEARCH_TERMS[item.name] ?? ''}`.toLowerCase().includes(normalizedQuery));
  }, [group, query]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#17191f] text-white">
      <div className="border-b border-white/10 p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search emoji groups"
          aria-label="Search emoji groups"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-amber-400/60"
        />
        {!query && (
          <div className="mt-2 flex gap-1 overflow-x-auto">
            {EMOJI_GROUPS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveGroup(item.name)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs ${activeGroup === item.name ? 'bg-white/15 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {visibleGroups.length ? visibleGroups.map((item) => (
          <section key={item.name} className="mb-4">
            {query && <h3 className="mb-2 text-xs font-medium text-zinc-400">{item.name}</h3>}
            <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
              {item.items.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  aria-label={`Insert ${emoji}`}
                  className="flex aspect-square items-center justify-center rounded-lg text-2xl transition-colors hover:bg-white/10 active:bg-white/15"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>
        )) : (
          <p className="py-8 text-center text-sm text-zinc-400">No emoji groups found.</p>
        )}
      </div>
      <p className="border-t border-white/10 px-3 py-2 text-[11px] text-zinc-500">Standard Unicode emoji. The way they look can vary by device.</p>
    </div>
  );
}
