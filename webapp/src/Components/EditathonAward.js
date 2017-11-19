import React from 'react';
import Loader from './Loader';
import WikiButton from './WikiButton'
import { WikiText } from './wikiPreview';
import Api from '../Api';
import { withTranslation } from '../translate';
import { groupBy } from '../utils';
import url from '../url';

class EditathonAward extends React.Component {
   static get contextTypes() {
      return {
         router: React.PropTypes.object.isRequired
      }
   }

   constructor(props) {
      super(props);
      this.state = {
         loading: false,
         processing: false,
         data: [],
         texts: [],
      };
      this.renderAward = this.renderAward.bind(this);
   }

   async componentWillMount() {
      this.setState({ loading: true });

      const data = await Api.getResults(this.props.editathon.code, 3);
      this.setState({ data, loading: false });
   }

   editText(rank, text) {
      const { texts } = this.state;
      texts[rank] = text;
      this.setState({ texts });
   }

   hasSignature(rank) {
      return /(^|[^~])~~~~(?!~)/.exec(this.state.texts[rank]);
   }

   addSignature(rank) {
      const text = this.state.texts[rank] || '';
      this.editText(rank, text.replace(/\s+$/, '') + ' ~~~~');
   }

   renderAward([ rank, users ]) {
      const text = this.state.texts[rank] || '';

      return <div key={rank} className='award'>
         <h3>{this.tr('rank', rank)}</h3>
         <div className='users'>
            {users.map((u, i) => <span key={i} className='user'>
               {u}
            </span>)}
         </div>
         <textarea rows={4} value={text} onChange={ev => this.editText(rank, ev.target.value)} />
         {text && !this.hasSignature(rank) && <div className='warning'>
            <span>
               {this.tr('noSignature', <button
                  key='sig' className='sig' onClick={() => this.addSignature(rank)}>~~~~</button>)}
            </span>
         </div>}
         <WikiText
            className='preview' padding={false} autoSize={true}
            text={text} wiki={this.props.editathon.wiki} title={'User talk:' + users[0]} />
      </div>;
   }

   goBack() {
      this.context.router.replace({
         pathname: url(`/editathons/${this.props.editathon.code}`),
      });
   }

   async process() {
      this.setState({ processing: true });

      try {
         const awards = {};
         for (const [ rank, users ] of this.getPlaces()) {
            for (const user of users) {
               awards[user] = this.state.texts[rank];
            }
         }

         await Api.award(this.props.editathon.code, awards);

         this.goBack();
      } catch(e) {
         alert(e);
         this.setState({ processing: false });
      }
   }

   tr(...args) {
      const { translation: { tr } } = this.props;
      return tr(...args);
   }

   isValid() {
      const { texts } = this.state;
      return texts.filter(x => x).length === this.getPlaces().length;
   }

   getPlaces() {
      return [...groupBy(this.state.data, r => r.rank, r => r.name)];
   }

   render() {
      const { loading, processing } = this.state;

      return <div className='EditathonAward'>
         <h2>{this.tr('title')}</h2>

         <Loader className='entries' loading={loading}>
            {this.getPlaces().map(this.renderAward)}
         </Loader>

         {!loading && <div className='buttons'>
            <WikiButton type='constructive' onClick={() => this.process()}
                        loading={processing} disabled={!this.isValid()}>
               {this.tr('award')}
            </WikiButton>
            <WikiButton onClick={() => this.goBack()} disabled={processing}>
               {this.tr('cancel')}
            </WikiButton>
         </div>}
      </div>;
   }
}

export default withTranslation(EditathonAward, 'EditathonAward');
