import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './RssFeed.module.scss';
import * as moment from 'moment';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PnPClientStorage } from "@pnp/common";
import * as strings from 'RssFeedWebPartStrings';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DisplayMode } from "@microsoft/sp-core-library";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IRssFeedItem {
  title: string;
  pubDate: string;
  link: string;
  description: string;
}
export interface IRssFeedProps {
  title: string;
  seeAllUrl: string;
  rssFeedUrl: string;
  apiKey: string;
  itemsCount: number;
  officeUIFabricIcon: string;
  showItemDescription: boolean;
  showItemPubDate: boolean;
  displayMode: DisplayMode;
  context: WebPartContext;
  updateProperty: (value: string) => void;
  cacheDuration: number;
  instanceId: string;
}

export const RssFeed: React.FunctionComponent<IRssFeedProps> = (props) => {

  const [items, setItems] = useState<IRssFeedItem[]>([]);

  useEffect(() => {

    const fetchData = async () => {
      const storage = new PnPClientStorage();
      const now = new Date();
      const cacheKey = `rssfeed-${props.context.pageContext.web.serverRelativeUrl}-${props.instanceId}`;
      const apiKey = props.apiKey && props.apiKey !== undefined ? `&api_key=${props.apiKey}` : '';
      const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(props.rssFeedUrl)}${apiKey}`;

      const json = await storage.local.getOrPut(cacheKey, async () => {
        const response = await fetch(rss2jsonUrl);
        return await response.json();
      }, moment(now).add(props.cacheDuration, 'm').toDate());

      setItems((json.items) ? json.items.splice(0, props.itemsCount) : []);
    };

    fetchData();

  }, []);

  return (
    <div className={styles.rssFeed}>
      <div className={styles.container}>
        {props.title || props.seeAllUrl ? <div className={styles.webpartHeader}>
          {props.title ? <span>{props.title}</span> : ''}
          <span className={styles.showAll}>
            {props.seeAllUrl ? <Text onClick={() => window.open(props.seeAllUrl, '_blank')} >{strings.SeeAllText}</Text> : ''}
          </span>
        </div> : ''}
        <ul className={styles.itemsList}>
          {(items) ? items.map((item, index) => (
            <Text className={styles.listItem} onClick={() => window.open(item.link.replace(/&amp;/g, '&'), '_blank')} key={`listItem_${index}`} title={item.link}>
              {props.officeUIFabricIcon ? <Icon iconName={props.officeUIFabricIcon} className={styles.icon} /> : ''}
              <div className={styles.content}>
                <div className={`${styles.listItemTitle}`}>
                  {item.title}
                </div>
                {item.description && props.showItemDescription ? <div className={`${styles.listItemDescription}`} >{item.description}</div> : ''}
                {item.pubDate && props.showItemPubDate ? <div className={`${styles.listItemPubDate}`}>{moment(item.pubDate).format("DD.MM.YYYY")}</div> : ''}
              </div>
            </Text>
          )) : null}
        </ul>
      </div>
    </div>
  );

};
