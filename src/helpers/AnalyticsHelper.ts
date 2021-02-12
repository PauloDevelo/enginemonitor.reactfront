import log from 'loglevel';
import onlineManager from '../services/OnlineManager';

export type EventName = 'login' | 'logout' | 'sign_up' | 'reset_password' | 'send_verification_email';
type ActionName = EventName | 'select_content' | 'delete_content' | 'add_content' | 'save_content' | 'click_thumbnail' | 'next' | 'previous' | 'share' | 'unshare' | 'copy_share_link' | 'rebuild_storage' | 'sync_storage' | 'cancel_sync_storage' | 'set_offline' | 'timeout';
export type ContentType = 'asset' | 'equipment' | 'task' | 'entry' | 'image';

export interface HttpRequestTimeoutProps {
  requestType: 'get' | 'post' | 'post_image' | 'delete';
  url: string;
  timeout: number;
}

export interface IAnalytics{
  sendEngagementEvent(eventName: EventName, props?: object): void;

  selectContent(contentType: ContentType): void;
  deleteContent(contentType: ContentType): void;
  addContent(contentType: ContentType): void;
  saveContent(contentType: ContentType): void;

  clickThumbnail(): void;
  nextImage(): void;
  previousImage(): void;

  share(): void;
  unshare(): void
  copyShareLink(): void;

  rebuildStorage(isUserInteraction: boolean): void;
  syncStorage(isUserInteraction: boolean): void;
  cancelSyncStorage(): void;

  setOffLineMode(offlineMode: boolean): void;

  httpRequestTimeout(httpRequestTimeoutProps: HttpRequestTimeoutProps): void;
}

class Analytics implements IAnalytics {
  sendEngagementEvent = (eventName: EventName, props: object = {}): void => {
    const gTagProps = { ...props, event_category: 'engagement' };

    this.sendEvent(eventName, gTagProps);
  };

  selectContent = (contentType: ContentType) => {
    const gTagProps = { event_category: 'engagement', content_type: contentType };
    this.sendEvent('select_content', gTagProps);
  };

  deleteContent = (contentType: ContentType): void => {
    const gTagProps = { event_category: 'engagement', content_type: contentType };
    this.sendEvent('delete_content', gTagProps);
  }

  addContent = (contentType: ContentType): void => {
    const gTagProps = { event_category: 'engagement', content_type: contentType };
    this.sendEvent('add_content', gTagProps);
  }

  saveContent = (contentType: ContentType): void => {
    const gTagProps = { event_category: 'engagement', content_type: contentType };
    this.sendEvent('save_content', gTagProps);
  }

  clickThumbnail = () => {
    const gTagProps = { event_category: 'image' };
    this.sendEvent('click_thumbnail', gTagProps);
  }

  nextImage = () => {
    const gTagProps = { event_category: 'image' };
    this.sendEvent('next', gTagProps);
  }

  previousImage = () => {
    const gTagProps = { event_category: 'image' };
    this.sendEvent('previous', gTagProps);
  }

  share = (): void => {
    const gTagProps = { event_category: 'engagement' };
    this.sendEvent('share', gTagProps);
  }

  unshare = (): void => {
    const gTagProps = { event_category: 'engagement' };
    this.sendEvent('unshare', gTagProps);
  }

  copyShareLink = (): void => {
    const gTagProps = { event_category: 'engagement' };
    this.sendEvent('copy_share_link', gTagProps);
  }

  rebuildStorage = (isUserInteraction: boolean): void => {
    const gTagProps = { event_category: 'engagement', method: isUserInteraction ? 'manual' : 'auto' };
    this.sendEvent('rebuild_storage', gTagProps);
  }

  syncStorage = (isUserInteraction: boolean): void => {
    const gTagProps = { event_category: 'engagement', method: isUserInteraction ? 'manual' : 'auto' };
    this.sendEvent('sync_storage', gTagProps);
  }

  cancelSyncStorage = (): void => {
    const gTagProps = { event_category: 'engagement' };
    this.sendEvent('cancel_sync_storage', gTagProps);
  }

  setOffLineMode = (offlineMode: boolean): void => {
    const gTagProps = { event_category: 'engagement', event_label: offlineMode ? 'offline' : 'online' };
    this.sendEvent('set_offline', gTagProps);
  }

  httpRequestTimeout = (httpRequestTimeoutProps: HttpRequestTimeoutProps): void => {
    const gTagProps = { event_category: 'timeout', event_label: httpRequestTimeoutProps.requestType, ...httpRequestTimeoutProps };
    this.sendEvent('timeout', gTagProps);
  };

  private sendEvent = (actionName: ActionName, gTagProps: object) => {
    if (process.env.NODE_ENV === 'production') {
      onlineManager.isOnline().then((isOnline) => {
        if (isOnline) {
          (window as any).gtag('event', actionName, gTagProps);
        }
      });
    } else {
      log.debug(`${actionName} : ${JSON.stringify(gTagProps)}`);
    }
  }
}

const analytics:IAnalytics = new Analytics();
export default analytics;
