import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Film, 
  Tv, 
  Sparkles, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Share2, 
  Clock, 
  Check, 
  Copy,
  ChevronRight,
  Filter,
  CheckCircle2,
  Video,
  Play,
  Loader2
} from 'lucide-react';
import { MOCK_EVENTS } from '../mockData';
import type { FriendsEvent, EventType } from '../types';

export const EventsHub = () => {
  const [eventsList, setEventsList] = useState<FriendsEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | EventType>('all');
  const [activeEventModal, setActiveEventModal] = useState<FriendsEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newFormat, setNewFormat] = useState('physical');
  const [newType, setNewType] = useState<EventType>('public_gathering');
  const [newDescription, setNewDescription] = useState('');
  const [newCity, setNewCity] = useState('Colombo');
  const [submitting, setSubmitting] = useState(false);

  // Fetch real events from database
  useEffect(() => {
    fetch('/api/v1/events?userId=usr_me')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEventsList(data.events);
        }
      })
      .catch(err => console.warn('Using local fallback events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter Logic
  const filteredEvents = eventsList.filter(evt => {
    if (selectedFilter === 'all') return true;
    return evt.type === selectedFilter;
  });

  const toggleRsvp = async (eventId: string) => {
    // Optimistic UI update
    setEventsList(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const isAttending = evt.rsvpStatus === 'attending';
        return {
          ...evt,
          rsvpStatus: isAttending ? 'none' : 'attending',
          attendeesCount: isAttending ? Math.max(0, evt.attendeesCount - 1) : evt.attendeesCount + 1
        };
      }
      return evt;
    }));

    try {
      const res = await fetch(`/api/v1/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_me' })
      });
      const data = await res.json();
      if (data.success) {
        setEventsList(prev => prev.map(evt => 
          evt.id === eventId 
            ? { ...evt, rsvpStatus: data.rsvpStatus, attendeesCount: data.attendeesCount }
            : evt
        ));
      }
    } catch (err) {
      console.error('RSVP persistence error:', err);
    }
  };

  const handleCopy = (eventId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          format: newFormat,
          description: newDescription,
          locationCity: newCity,
          locationName: newFormat === 'physical' ? `${newCity} Public Gathering Point` : 'Soulverse Virtual Lounge',
          date: 'Upcoming Saturday',
          time: '6:30 PM – 9:00 PM',
          capacity: 25,
          tags: ['Community', 'Connection', 'Gathering'],
          rules: ['Zero harassment tolerance', 'Respect mutual boundaries', 'Curiosity first']
        })
      });

      const data = await res.json();
      if (data.success && data.event) {
        setEventsList(prev => [data.event, ...prev]);
        setShowCreateModal(false);
        setNewTitle('');
        setNewDescription('');
        setNotification(`"${data.event.title}" published and stored in SQLite database!`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Event publish error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}
      
      {/* 1. Header Banner: FRIENDS EVENTS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                FRIENDS EVENTS
              </span>
              <span className="text-xs text-slate-400">Public Meets • Private Parties • Watch Together</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Don't just meet people. Make memories together.
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Approaching strangers 1-on-1 can be intimidating. Joining an outdoor photography hike, 
              movie watch party, or board game night lets human connection happen naturally around shared activities.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-lg shadow-amber-500/20 transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create an Event</span>
          </button>
        </div>
      </div>

      {/* 2. Categorical Filtering Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Experiences' },
          { id: 'public_gathering', label: 'Public Gatherings' },
          { id: 'watch_party', label: 'Watch Parties (Sync)' },
          { id: 'online_party', label: 'Online Rooms & Co-Working' },
          { id: 'private_party', label: 'Private Guestlists' },
          { id: 'meet_new_people', label: 'Structured Meetups' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(evt => {
          const isAttending = evt.rsvpStatus === 'attending';

          return (
            <div 
              key={evt.id} 
              className="bg-[#121927] border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col transition group"
            >
              {/* Event Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={evt.coverImage} 
                  alt={evt.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121927] via-transparent to-black/30" />

                {/* Event Format Badge */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    {evt.format}
                  </span>
                  {evt.type === 'watch_party' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 backdrop-blur-md text-purple-200 border border-purple-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Film className="w-2.5 h-2.5" />
                      <span>Watch Sync</span>
                    </span>
                  )}
                </div>

                {/* Capacity Counter */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                  {evt.attendeesCount} / {evt.capacity} joined
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] text-amber-400 font-semibold block">{evt.category}</span>
                  <h3 className="text-base font-extrabold text-white leading-tight mt-0.5 line-clamp-1">
                    {evt.title}
                  </h3>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                
                {/* Logistics */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-1">{evt.locationName}</span>
                  </div>

                  {evt.exactAddressHidden && (
                    <span className="text-[10px] text-amber-400/90 block italic pl-5.5">
                      (Exact street venue hidden until RSVP approval)
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                {/* Host Info */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={evt.hostAvatar} 
                      alt={evt.hostName} 
                      className="w-6 h-6 rounded-full object-cover border border-amber-500/40"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-300 font-medium">{evt.hostName}</span>
                      {evt.hostVerified && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(evt.id)}
                    className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
                    title="Share Event Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => toggleRsvp(evt.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isAttending
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {isAttending ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isAttending ? 'RSVP Confirmed' : 'Request to Join'}</span>
                  </button>

                  <button
                    onClick={() => setActiveEventModal(evt)}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium cursor-pointer transition"
                  >
                    Details
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL: Event Deep-Dive & Watch Party Integration */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0f1422] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <button
              onClick={() => setActiveEventModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {activeEventModal.type.replace('_', ' ')}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 mb-3">
              {activeEventModal.title}
            </h3>

            {/* Banner */}
            <div className="h-52 rounded-2xl overflow-hidden mb-5">
              <img 
                src={activeEventModal.coverImage} 
                alt={activeEventModal.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">When</span>
                <span className="text-slate-200 font-semibold">{activeEventModal.date} • {activeEventModal.time}</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue</span>
                <span className="text-slate-200 font-semibold">{activeEventModal.locationName}</span>
              </div>
            </div>

            {/* Watch Party Specific Section */}
            {activeEventModal.watchPartyDetails && (
              <div className="bg-purple-950/30 border border-purple-800/40 p-4 rounded-2xl mb-5 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                  <Play className="w-3.5 h-3.5" />
                  <span>Synchronized Video & Voice Room</span>
                </div>
                <p className="text-xs text-slate-300">
                  Feature Title: <span className="font-semibold text-white">{activeEventModal.watchPartyDetails.mediaTitle}</span><br />
                  Player: Synchronized peer playback via {activeEventModal.watchPartyDetails.streamServiceAuthorized}.
                </p>
              </div>
            )}

            {/* Description & Rules */}
            <div className="space-y-3 mb-6 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white text-sm">About This Event:</h4>
              <p>{activeEventModal.description}</p>

              <h4 className="font-bold text-white text-sm pt-2">Community Guidelines & Rules:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                {activeEventModal.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Footer RSVP */}
            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  toggleRsvp(activeEventModal.id);
                  setActiveEventModal(null);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Confirm Attendance / Request to Join
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL: Create an Event Draft */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0f1422] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Create an Experience</h3>
            <p className="text-xs text-slate-400 mb-4">
              Gather people around movies, games, tea, or hiking. No influencer status required.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Event Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midnight Film Noir & Tea Tasting"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Format</label>
                  <select 
                    value={newFormat} 
                    onChange={(e) => {
                      const f = e.target.value;
                      setNewFormat(f);
                      if (f === 'physical') setNewType('public_gathering');
                      else if (f === 'watch_party') setNewType('watch_party');
                      else if (f === 'online_party') setNewType('online_party');
                      else setNewType('private_party');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="physical">Physical Public Gathering</option>
                    <option value="watch_party">Online Watch Together</option>
                    <option value="online_party">Online Room Lounge</option>
                    <option value="private_party">Private Invite Party</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Colombo, Kandy"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What will you do? What makes this cozy and low-pressure?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold block">Safety Built In:</span>
                Exact street addresses for physical events are kept concealed until you approve the guest.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{submitting ? 'Publishing to Database...' : 'Publish Experience to SQLite Database'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
