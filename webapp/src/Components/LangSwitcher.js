import React from 'react';
import DropDown from './DropDown';
import { withTranslation } from '../translate';

function getItems({ allLangs, translateFrom: trF }) {
   return allLangs()
      .map(x => ({ code: x, name: trF(x, '_name') }));
}

function matchItem(item, value) {
   value = value.toLowerCase();
   return item.code.toLowerCase().startsWith(value) ||
          item.name.toLowerCase().startsWith(value);
}

function LangSwitcher({ translation }) {
   return <DropDown
      className='LangSwitcher'
      renderButton={() => <button>{'\u00a0'}</button>}
      items={getItems(translation)}
      renderItem={x => `${x.code}: ${x.name}`}
      getValue={x => x.code}
      filter={true}
      value={translation.curLang}
      onChange={lg => translation.setLang(lg)}
      matchItem={matchItem} />
}

export default withTranslation(LangSwitcher);
