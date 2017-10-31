import React from 'react';
import classNames from 'classnames';
import { withTranslation } from './../translate';
import sortby from './../sortBy';
import WikiButton from './WikiButton';
import Api from './../Api';

class ManageArticles extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         checked: new Set(),
         loading: false,
      };
   }

   toggle(id) {
      const { checked } = this.state;

      if (checked.has(id)) {
         checked.delete(id);
      } else {
         checked.add(id);
      }

      this.setState({});
   }

   async remove() {
      this.setState({ loading: true });
      const { checked, loading } = this.state;

      try {
         await Api.removeArticles(this.props.editathon.code, [...checked]);
         checked.clear();
         await this.props.onReloadEditathon();
      } finally {
         this.setState({ loading: false });
      }
   }

   render() {
      const { editathon, translation: { translate, tr } } = this.props;
      const { checked, loading } = this.state;
      
      return <div className='ManageArticles'>
         <div className='buttons'>
            <WikiButton type='destructive' disabled={checked.size === 0} onClick={() => this.remove()} loading={loading}>
               {tr('removeSelected')}
            </WikiButton>
         </div>

         <table>
            <thead>
               <tr>
                  <th className='check'></th>
                  <th className='user'>Участник</th>
                  <th className='article'>Статья</th>
                  <th className='date'>Дата добавления</th>
               </tr>
            </thead>
            <tbody>
               {editathon.articles.sort(sortby(
                  sortby(a => a.dateAdded).desc,
                  a => a.name,
                  a => a.id
               )).map(a => <tr key={a.id} tabIndex={0} onClick={() => this.toggle(a.id)} onKeyDown={e => {
                  if (e.key === 'Enter') {
                     this.toggle(a.id);
                  } else if (e.key === ' ') {
                     this.toggle(a.id);
                  } else {
                     return;
                  }

                  e.preventDefault();
               }}>
                  <td className={classNames('check', checked.has(a.id) && 'checked')}></td>
                  <td className='user'>{a.user}</td>
                  <td className='article'>{a.name}</td>
                  <td className='date'>{translate('formatDate', a.dateAdded, 'L LT')}</td>
               </tr>)}
            </tbody>
         </table>
      </div>;
   }
}

export default withTranslation(ManageArticles, 'ManageArticles');
