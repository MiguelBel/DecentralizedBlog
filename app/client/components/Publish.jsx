import React, { Component } from 'react';
import SimpleMDE from 'simplemde'
import 'simplemde/dist/simplemde.min.css';

import Contract from './Blog/Contract';
import Spinner from './Blog/Spinner';

import TransactionsHistory from './TransactionsHistory'

import showdown from 'showdown';

class Publish extends Component {
  constructor(props) {
    super(props);

    this.state = {
      publishingPost: false
    }

    this.network = this.props.match.params.network;
    this.address = this.props.match.params.address;

    this.lightWalletClient = this.props.lightWalletClient;

    this.publishEntry = this.publishEntry.bind(this)
  }

  componentDidMount() {
    this.editor = new SimpleMDE({
      element: document.getElementById("newPostContent"),
      spellChecker: false,
      previewRender: function(plainText) {
        const converter = new showdown.Converter();
        return converter.makeHtml(plainText)
      }
    });
  }

  render() {
    if(this.state.publishingPost) {
      return (
        <section className="container page-body-wrapper">
          <div className="content-wrapper full-page-wrapper">
          <Spinner />
          </div>
        </section>
      )
    }

    return (
      <section className="container page-body-wrapper">
        <div className="content-wrapper full-page-wrapper">
          <form className="forms-sample">
            <div className="form-group">
              <label htmlFor="newPostTitle">Title:</label>
              <input type="text" className="form-control p-input" id="newPostTitle"/>
            </div>
            <div className="form-group">
              <label htmlFor="newPostContent">Content (in markdown):</label>
              <textarea id="newPostContent"></textarea>
            </div>
            <button className="btn btn-primary cursor" onClick={this.publishEntry}>Publish</button>
          </form>
        </div>
      </section>
    )
  }

  publishEntry(event) {
    event.preventDefault();

    this.setState({
      publishingPost: true
    })

    const title = document.getElementById("newPostTitle").value;
    const content = this.editor.value();

    const post = { title: title, content: content }

    new Contract(this.props.lightWalletClient, this.address).publishPost(post, this.registerEvent.bind(this), this.redirectToPublishedContent.bind(this));
  }

  registerEvent(tx, address, title) {
    if(!tx) {
      return;
    }

    const transactionsHistory = new TransactionsHistory(this.props.match.params.network);

    const eventTitle = "Publish content in publishing platform";
    const additionalInfo = {
      'Title': title,
      'Contract address': address
    }

    transactionsHistory.registerNewTransaction(tx, eventTitle, additionalInfo);
  }

  redirectToPublishedContent() {
    const contract = new Contract(this.props.lightWalletClient, this.address)

    setTimeout(function() {
      this.setState({
        publishingPost: false
      })

      contract.countPosts(function(numberOfPosts){
        const reference = numberOfPosts - 1;

        this.props.history.push(`/${this.network}/${this.address}/${reference}`);
      }.bind(this))
    }.bind(this), 500);
  }
}

export default Publish;
