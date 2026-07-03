/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, Sparkles, Trophy, Calendar, Zap, Compass, CheckCircle2, Lock } from "lucide-react";
import { Achievement, UserProfile } from "../types.js";

interface AchievementsViewProps {
  profile: UserProfile;
  achievements: Achievement[];
}

export default function AchievementsView({ profile, achievements }: AchievementsViewProps) {
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const progressPercent = Math.min(100, Math.floor((unlockedCount / achievements.length) * 100));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-5 no-scrollbar pb-24">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-pink-500 animate-pulse" />
          <span>Explorer Medals</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Track your traveler level, active streaks, and unlock legendary achievement badges.
        </p>
      </div>

      {/* Explorer Level Progress Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50/80 via-white to-pink-50/40 border border-indigo-100 relative overflow-hidden mb-6 shrink-0 shadow-sm">
        {/* Glow vector back */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/10 blur-2xl rounded-full" />
        
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-wider block font-bold">Explorer Rank</span>
            <h3 className="font-extrabold text-slate-800 text-lg mt-0.5 flex items-center gap-1.5">
              <span>Veteran Globetrotter</span>
              <Sparkles className="w-4 h-4 text-pink-500" />
            </h3>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-pink-400 to-indigo-600 text-white font-black text-sm rounded-xl border border-indigo-200 shadow-sm flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold text-indigo-100/80">LVL</span>
            <span>{profile.level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] font-mono mb-1.5 text-slate-500 font-bold">
            <span>XP: {profile.xp} / {profile.xpToNextLevel}</span>
            <span className="text-indigo-600">{Math.floor((profile.xp / profile.xpToNextLevel) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-[2px]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-pink-400 via-indigo-500 to-indigo-600"
              style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-2 text-right font-bold">
            +{profile.xpToNextLevel - profile.xp} XP to Level {profile.level + 1}
          </span>
        </div>
      </div>

      {/* Daily Streak Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
        <div className="rounded-2xl p-4 bg-white border border-indigo-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
            <Zap className="w-5 h-5 fill-orange-500/10" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Active Streak</span>
            <h4 className="font-extrabold text-slate-850 text-md mt-0.5">{profile.streak} Days</h4>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white border border-indigo-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Badges Earned</span>
            <h4 className="font-extrabold text-slate-850 text-md mt-0.5">{unlockedCount} / {achievements.length}</h4>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3 select-none">
          <h3 className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Achievements Gallery</h3>
          <span className="text-[10px] font-mono text-indigo-600 font-bold">{progressPercent}% Unlocked</span>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200/60">
          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex flex-col gap-3 flex-grow overflow-y-auto no-scrollbar">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlockedAt !== null;
            return (
              <div 
                key={ach.id}
                className={`rounded-2xl p-3.5 border flex gap-4 items-center transition-all ${
                  isUnlocked 
                    ? "bg-white border-indigo-100 shadow-sm" 
                    : "bg-slate-50/50 border-slate-200/60 opacity-65"
                }`}
              >
                {/* Badge Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isUnlocked ? ach.badgeColor : "from-slate-100 to-slate-200 text-slate-400"} flex items-center justify-center text-white shrink-0 shadow-inner relative border border-slate-200/60`}>
                  {isUnlocked ? (
                    <Trophy className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Badge Info */}
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-extrabold text-sm truncate ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}>{ach.title}</h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">{ach.description}</p>
                  
                  {isUnlocked && ach.unlockedAt && (
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-1.5 font-bold">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
