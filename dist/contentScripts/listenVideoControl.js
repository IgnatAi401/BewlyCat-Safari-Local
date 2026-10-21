function createListenVideoMode(host,onChange){let LISTENING_CLASS="bewly-player-listening",OVERLAY_CLASS="bewly-listen-video-overlay",PLAYER_ROOT_SELECTOR=".bpx-player-container, .bilibili-player, #bilibili-player, .squirtle-video-wrap",VIDEO_AREA_SELECTOR2=".bpx-player-video-area, .bilibili-player-video-wrap, .squirtle-video-wrap",COVER_SIZE_SUFFIX="@672w_378h_1c_!web-home-common-cover",DANMAKU_SWITCH_SELECTOR=".bilibili-player-video-danmaku-switch > input[type=checkbox],.bpx-player-dm-switch input[type=checkbox]",musicNoteIcon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" style="width: 100%; height: 100%;">
    <path d="M30 18 66 14v12L30 30Zm0 8h8v30h-8Zm28-4h8v34h-8Z" fill="currentColor"/>
    <ellipse cx="30" cy="58" rx="13" ry="9" transform="rotate(-18 30 58)" fill="currentColor"/>
    <ellipse cx="58" cy="58" rx="13" ry="9" transform="rotate(-18 58 58)" fill="currentColor"/>
  </svg>`,listenActive=!1,disposed=!1,metaRequestId=0,danmakuWasEnabled=null,lastMetaKey="",lastMetaOverlay=null;function translate(key){return host.translate(key)}function isListenVideoModeActive(){return listenActive}function findPlayerRoot(){let area=findVideoArea();return area?.closest(PLAYER_ROOT_SELECTOR)??area}function findVideoArea(){return document.querySelector(VIDEO_AREA_SELECTOR2)}function findOverlay(){return document.querySelector(`.${OVERLAY_CLASS}`)}function createOverlay(){let overlay=document.createElement("div");overlay.className=OVERLAY_CLASS;let album=document.createElement("div");album.className="bewly-listen-video-album",album.classList.add("bewly-listen-video-cover-missing");let cover=document.createElement("img");cover.className="bewly-listen-video-cover",cover.alt="",cover.decoding="async",cover.addEventListener("error",()=>album.classList.add("bewly-listen-video-cover-missing"));let fallback=document.createElement("div");fallback.className="bewly-listen-video-cover-fallback",fallback.innerHTML=musicNoteIcon,album.append(cover,fallback);let info=document.createElement("div");info.className="bewly-listen-video-info";let title=document.createElement("div");title.className="bewly-listen-video-title";let owner=document.createElement("div");owner.className="bewly-listen-video-owner";let badge=document.createElement("div");badge.className="bewly-listen-video-badge";let equalizer=document.createElement("span");equalizer.className="bewly-listen-video-equalizer",equalizer.setAttribute("aria-hidden","true"),equalizer.innerHTML="<i></i><i></i><i></i>";let badgeText=document.createElement("span");return badgeText.className="bewly-listen-video-badge-text",badgeText.textContent=translate("player_listen.listening"),badge.append(equalizer,badgeText),info.append(title,owner,badge),overlay.append(album,info),overlay}function readDomTitle(){let headingText=document.querySelector(".video-info-title, h1.video-title")?.textContent?.trim();return headingText||document.title.replace(/_哔哩哔哩.*$/,"").trim()}function parseBvidFromLocation(){let fromPath=location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/);return fromPath?.[1]?fromPath[1]:new URLSearchParams(location.search).get("bvid")??""}function applyTitleText(title,text){title.textContent=text}function findDanmakuSwitch(){return document.querySelector(DANMAKU_SWITCH_SELECTOR)}function setDanmakuEnabled(enabled){let danmakuSwitch=findDanmakuSwitch();if(!danmakuSwitch)return!1;if(danmakuSwitch.checked===enabled)return!0;let clickableParent=danmakuSwitch.closest("label")||(danmakuSwitch.parentElement instanceof HTMLElement?danmakuSwitch.parentElement:null);return clickableParent?clickableParent.click():danmakuSwitch.click(),danmakuSwitch.checked!==enabled&&(danmakuSwitch.checked=enabled,danmakuSwitch.dispatchEvent(new Event("change",{bubbles:!0}))),danmakuSwitch.checked===enabled}function pauseDanmakuForListenMode(){let danmakuSwitch=findDanmakuSwitch();danmakuSwitch&&(danmakuWasEnabled??=danmakuSwitch.checked,setDanmakuEnabled(!1))}function restoreDanmakuAfterListenMode(){danmakuWasEnabled!==null&&setDanmakuEnabled(danmakuWasEnabled),danmakuWasEnabled=null}function updateListenVideoMeta(){let overlay=findOverlay();if(!overlay)return;let key=`${location.href}:${host.getSettings().language}`;if(lastMetaKey===key&&lastMetaOverlay===overlay)return;lastMetaKey=key,lastMetaOverlay=overlay;let requestId=++metaRequestId,album=overlay.querySelector(".bewly-listen-video-album"),cover=overlay.querySelector(".bewly-listen-video-cover"),title=overlay.querySelector(".bewly-listen-video-title"),owner=overlay.querySelector(".bewly-listen-video-owner");title&&applyTitleText(title,readDomTitle()),owner&&(owner.textContent=""),album?.classList.add("bewly-listen-video-cover-missing"),cover?.removeAttribute("src");let badge=overlay.querySelector(".bewly-listen-video-badge-text");badge&&(badge.textContent=translate("player_listen.listening"));let bvid=parseBvidFromLocation();!bvid||!album||!cover||!title||!owner||host.getVideoInfo(bvid).then(res=>{if(requestId!==metaRequestId||!overlay.isConnected||res.code!==0)return;let data=res.data;data?.title&&(applyTitleText(title,data.title),owner.textContent=data.owner?.name??"",data.pic?(album.classList.remove("bewly-listen-video-cover-missing"),cover.src=`${data.pic.replace(/^https?:/,"")}${COVER_SIZE_SUFFIX}`):album.classList.add("bewly-listen-video-cover-missing"))}).catch(()=>{})}function applyListenMode(){let area=findVideoArea();if(!area)return!1;(area.closest(PLAYER_ROOT_SELECTOR)??findPlayerRoot())?.classList.add(LISTENING_CLASS);let existingOverlay=findOverlay();return existingOverlay?.parentElement!==area&&(existingOverlay?.remove(),area.appendChild(createOverlay())),updateListenVideoMeta(),!0}function exitListenMode(){document.querySelectorAll(`.${LISTENING_CLASS}`).forEach(root=>root.classList.remove(LISTENING_CLASS)),document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach(overlay=>overlay.remove())}function dispatchListenChange(){onChange()}function toggleListenVideoMode(){if(!disposed){if(listenActive)listenActive=!1,metaRequestId++,lastMetaKey="",lastMetaOverlay=null,exitListenMode(),restoreDanmakuAfterListenMode();else{if(!host.getSettings().enableListenVideo||!host.isPlaybackPage())return;if(document.pictureInPictureElement){document.exitPictureInPicture().then(()=>{!listenActive&&host.getSettings().enableListenVideo&&toggleListenVideoMode()}).catch(()=>{});return}listenActive=applyListenMode(),listenActive&&pauseDanmakuForListenMode()}dispatchListenChange()}}function ensureListenVideoModeSynced(){listenActive&&(applyListenMode(),pauseDanmakuForListenMode())}function dispose(){listenActive&&toggleListenVideoMode(),metaRequestId++,disposed=!0}return{isActive:isListenVideoModeActive,toggle:toggleListenVideoMode,sync:ensureListenVideoModeSynced,needsSync:()=>listenActive&&(findDanmakuSwitch()?.checked||!findPlayerRoot()?.classList.contains(LISTENING_CLASS)),refreshMeta:()=>{lastMetaKey="",ensureListenVideoModeSynced()},dispose}}var listenVideo_default=`.bewly-listen-video-control {
  position: relative;
  overflow: visible;
}
.bewly-listen-video-control .bewly-player-tooltip {
  position: absolute;
  bottom: calc(100% + var(--bew-space-2, 8px));
  left: 50%;
  z-index: 2;
  padding: var(--bew-space-1, 4px) var(--bew-space-2, 8px);
  border-radius: var(--bew-radius-sm, 4px);
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  box-shadow: var(--bew-shadow-1, 0 2px 8px rgba(0, 0, 0, 0.2));
  font-size: var(--bew-font-size-caption, 12px);
  font-weight: var(--bew-font-weight-medium, 500);
  line-height: var(--bew-line-height-caption, 16px);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, var(--bew-space-1, 4px));
  transition:
    opacity var(--bew-duration-fast, 150ms) var(--bew-ease-out, ease-out),
    visibility var(--bew-duration-fast, 150ms) var(--bew-ease-out, ease-out),
    transform var(--bew-duration-fast, 150ms) var(--bew-ease-out, ease-out);
}
.bewly-listen-video-control:hover .bewly-player-tooltip,
.bewly-listen-video-control:focus-visible .bewly-player-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}

.bewly-player-listening video,
.bewly-player-listening .bpx-player-dm,
.bewly-player-listening .bilibili-player-danmaku {
  visibility: hidden;
}
.bewly-player-listening .bewly-listen-video-overlay {
  display: flex;
}

.bewly-listen-video-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--bew-space-4, 16px);
  padding: var(--bew-space-6, 24px);
  background: rgba(0, 0, 0, 0.96);
  pointer-events: none;
}

.bewly-listen-video-album {
  position: relative;
  width: clamp(140px, 26%, 280px);
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: var(--bew-radius-full, 9999px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  animation: bewly-listen-spin 24s linear infinite;
}

.bewly-listen-video-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bewly-listen-video-cover-fallback {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--bew-fill-2, rgba(255, 255, 255, 0.1));
  color: rgba(255, 255, 255, 0.35);
}
.bewly-listen-video-cover-fallback svg {
  width: 44%;
  height: 44%;
}

.bewly-listen-video-cover-missing .bewly-listen-video-cover {
  display: none;
}

.bewly-listen-video-cover-missing .bewly-listen-video-cover-fallback {
  display: flex;
}

.bewly-listen-video-info {
  display: flex;
  max-width: min(92%, 720px);
  flex-direction: column;
  align-items: center;
  gap: var(--bew-space-2, 8px);
}

.bewly-listen-video-title {
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  color: #fff;
  font-size: var(--bew-font-size-heading, 20px);
  font-weight: var(--bew-font-weight-semibold, 600);
  line-height: var(--bew-line-height-heading, 28px);
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.bewly-listen-video-owner {
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--bew-font-size-control, 13px);
  font-weight: var(--bew-font-weight-regular, 400);
  line-height: var(--bew-line-height-control, 18px);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bewly-listen-video-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--bew-space-2, 8px);
  height: 26px;
  padding: 0 var(--bew-space-3, 12px);
  border-radius: var(--bew-radius-full, 9999px);
  color: var(--bew-theme-color, #00a1d6);
  background: rgba(255, 255, 255, 0.08);
  font-size: var(--bew-font-size-control, 13px);
  font-weight: var(--bew-font-weight-medium, 500);
  line-height: var(--bew-line-height-control, 18px);
}

.bewly-listen-video-equalizer {
  display: inline-flex;
  align-items: flex-end;
  gap: var(--bew-space-1, 4px);
  height: 12px;
}
.bewly-listen-video-equalizer i {
  width: 3px;
  border-radius: 1px;
  background: currentColor;
  transform-origin: bottom;
  animation: bewly-listen-eq 1s ease-in-out infinite;
}
.bewly-listen-video-equalizer i:nth-child(1) {
  height: 6px;
}
.bewly-listen-video-equalizer i:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}
.bewly-listen-video-equalizer i:nth-child(3) {
  height: 8px;
  animation-delay: 0.4s;
}

.bpx-player-container[data-screen="mini"] .bewly-listen-video-overlay {
  gap: var(--bew-space-2, 8px);
  padding: var(--bew-space-2, 8px);
}
.bpx-player-container[data-screen="mini"] .bewly-listen-video-album,
.bpx-player-container[data-screen="mini"] .bewly-listen-video-owner {
  display: none;
}
.bpx-player-container[data-screen="mini"] .bewly-listen-video-title {
  font-size: var(--bew-font-size-title, 15px);
  line-height: var(--bew-line-height-title, 22px);
}

@keyframes bewly-listen-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes bewly-listen-eq {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}
.bpx-player-container[data-screen="mini"] .bewly-listen-video-control {
  display: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .bewly-listen-video-album,
  .bewly-listen-video-equalizer i {
    animation: none;
  }
}
`;var PLAYER_CONTROL_BAR_SELECTOR=".bpx-player-control-bottom-right",BUTTON_CLASS="bewly-listen-video-control",TOOLTIP_CLASS="bewly-player-tooltip",VIDEO_AREA_SELECTOR=".bpx-player-video-area, .bilibili-player-video-wrap, .squirtle-video-wrap",listenIcon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" style="width: 100%; height: 100%;">
  <path d="M44 14C28.5 14 18 25.5 18 42v6h13v-6c0-9.5 5-15 13-15s13 5.5 13 15v6h13v-6c0-16.5-10.5-28-26-28Z" fill="currentColor"/>
  <rect x="14" y="46" width="20" height="28" rx="9" fill="currentColor"/>
  <rect x="54" y="46" width="20" height="28" rx="9" fill="currentColor"/>
</svg>`;function initListenVideoControl(host){let controlContainer=null,disposed=!1,syncQueued=!1,discoveryTimer,metadataTimer,discoveryDeadline=0,observedRoot=null,observedArea=null,mode=createListenVideoMode(host,()=>{updateControlState(),scheduleSync()}),style=document.createElement("style");style.dataset.bewlyListenVideo="",style.textContent=listenVideo_default,document.documentElement.appendChild(style);function getButtonLabel(){return host.translate(mode.isActive()?"player_listen.exit":"player_listen.enter")}function updateControlState(button=controlContainer){if(!button)return;let label=getButtonLabel(),active=mode.isActive();if(button.getAttribute("aria-label")===label&&button.classList.contains("bpx-state-entered")===active)return;button.setAttribute("aria-label",label),button.setAttribute("aria-pressed",String(active));let tooltip=button.querySelector(`.${TOOLTIP_CLASS}`);tooltip&&(tooltip.textContent=label),button.classList.toggle("bpx-state-entered",active)}function createControlContainer(){let label=getButtonLabel(),container=document.createElement("div");container.className=`bpx-player-ctrl-btn ${BUTTON_CLASS}`,container.setAttribute("role","button"),container.setAttribute("aria-label",label),container.setAttribute("aria-pressed",String(mode.isActive())),container.setAttribute("tabindex","0");let tooltip=document.createElement("span");tooltip.className=TOOLTIP_CLASS,tooltip.setAttribute("role","tooltip"),tooltip.textContent=label;let icon=document.createElement("div");icon.className="bpx-player-ctrl-btn-icon bewly-listen-video-icon";let iconWrapper=document.createElement("span");return iconWrapper.className="bpx-common-svg-icon",iconWrapper.innerHTML=listenIcon,icon.appendChild(iconWrapper),container.append(icon,tooltip),container.addEventListener("mousedown",event=>{event.preventDefault()}),container.addEventListener("click",()=>{mode.toggle(),updateControlState(container)}),container.addEventListener("keydown",event=>{event.key!=="Enter"&&event.key!==" "||(event.preventDefault(),event.stopPropagation(),!event.repeat&&(mode.toggle(),updateControlState(container)))}),container}function removeControl(){let oldControl=controlContainer,sibling=oldControl?.parentElement?.querySelector(".bewly-video-screenshot-control, .bewly-widescreen-control, .bewly-local-loudness-control");oldControl?.remove(),controlContainer=null,sibling&&host.schedulePlayerControlFit(sibling)}function scheduleSync(){syncQueued||disposed||(syncQueued=!0,queueMicrotask(()=>{syncQueued=!1,disposed||sync()}))}let observer=new MutationObserver(()=>{let area=document.querySelector(VIDEO_AREA_SELECTOR);(!observedRoot?.isConnected||area!==observedArea||host.getSettings().showListenVideoButton&&!controlContainer?.isConnected||mode.isActive()&&!area?.querySelector(".bewly-listen-video-overlay")||mode.needsSync())&&(observedRoot?.isConnected||(discoveryDeadline=Date.now()+15e3),scheduleSync())});function observe(root,area){if(root===observedRoot&&area===observedArea||(observer.disconnect(),observedRoot=root,observedArea=area,!root))return;observer.observe(root,{childList:!0,subtree:!0});let parent=root.parentElement;for(;parent;)observer.observe(parent,{childList:!0}),parent=parent.parentElement}function retryDiscovery(){discoveryTimer||Date.now()>=discoveryDeadline||(discoveryTimer=setTimeout(()=>{discoveryTimer=void 0,scheduleSync()},500))}function sync(){if(!host.getSettings().enableListenVideo||!host.isPlaybackPage())return;mode.sync();let area=document.querySelector(VIDEO_AREA_SELECTOR),bar=document.querySelector(PLAYER_CONTROL_BAR_SELECTOR),root=area?.closest("#playerWrap, #bilibili-player, #bilibiliPlayer, .bpx-player-container, .bilibili-player")??area??bar?.parentElement??null;if(observe(root,area),area||retryDiscovery(),!host.getSettings().showListenVideoButton){removeControl();return}if(controlContainer?.isConnected){updateControlState();return}controlContainer=null;let anchor=bar?.querySelector(".bewly-video-screenshot-control")??bar?.querySelector(".bpx-player-ctrl-volume");if(!anchor){retryDiscovery();return}controlContainer=createControlContainer(),anchor.insertAdjacentElement("afterend",controlContainer),updateControlState(),host.schedulePlayerControlFit(controlContainer)}function refresh(){disposed||(discoveryDeadline=Date.now()+15e3,scheduleSync(),clearTimeout(metadataTimer),metadataTimer=setTimeout(()=>{!disposed&&host.isPlaybackPage()&&mode.refreshMeta()},1200))}function onVisibility(){document.visibilityState==="visible"&&refresh()}function onDanmakuChange(){mode.needsSync()&&scheduleSync()}function onPictureInPicture(){mode.isActive()&&mode.toggle()}let events=["pushstate","replacestate","popstate","hashchange","pageshow"];return events.forEach(event=>window.addEventListener(event,refresh)),document.addEventListener("visibilitychange",onVisibility),document.addEventListener("loadedmetadata",refresh,!0),document.addEventListener("change",onDanmakuChange,!0),document.addEventListener("enterpictureinpicture",onPictureInPicture,!0),refresh(),{toggle:()=>{disposed||mode.toggle()},refresh,dispose:()=>{disposed=!0,observer.disconnect(),clearTimeout(discoveryTimer),clearTimeout(metadataTimer),events.forEach(event=>window.removeEventListener(event,refresh)),document.removeEventListener("visibilitychange",onVisibility),document.removeEventListener("loadedmetadata",refresh,!0),document.removeEventListener("change",onDanmakuChange,!0),document.removeEventListener("enterpictureinpicture",onPictureInPicture,!0),mode.dispose(),removeControl(),style.remove()}}}export{initListenVideoControl};
