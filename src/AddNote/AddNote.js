import React, { Component } from "react";

import NotefulForm from "../NotefulForm/NotefulForm";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import ApiContext from "../ApiContext";
import config from "../config";

import PropTypes from "prop-types";
import { parse } from "date-fns";

export default class AddNote extends Component {
  static defaultProps = {
    history: {
      push: () => {},
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      verification: false,
      verification2: true,
    };
  }

  static contextType = ApiContext;

  checkLength(name) {
    if (name.length > 0) {
      this.setState({ verification: true });
    } else {
      this.setState({ verification: false });
    }
  }

  handleSubmit = (event, folders) => {
    event.preventDefault();
    if (
      !folders.find((folder) => folder.id === event.target["note-f-id"].value)
    ) {
      this.setState({ verification2: false });
      return;
    }

    const note = {
      name: event.target["note-name"].value,
      content: event.target["note-content"].value,
      folderId: event.target["note-f-id"].value,
      modified: new Date(),
    };

    fetch(`${config.API_ENDPOINT}/notes`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(note),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((event) => Promise.reject(event));
        }
        return response.json();
      })
      .then((note) => {
        this.context.addNote(note);
        this.props.history.push(`/folder/${note.folderId}`);
      })
      .catch((error) => {
        console.error({ error });
      });
  };

  validateName() {
    const name = this.state.name.value.trim();
    if (name.length === 0) {
      return "Name is required";
    }
  }

  render() {
    const { folders = [] } = this.context;

    return (
      <ErrorBoundary>
        <section>
          <h3>Add a note</h3>
          {this.state.verification2
            ? null
            : alert("FOLDER NOT SELECTED! \n To continue select a folder")}
          <NotefulForm onSubmit={(e) => this.handleSubmit(e, folders)}>
            <div>
              <label htmlFor="note-name-input">Name</label>
              <input
                type="text"
                name="note-name"
                onChange={(e) => this.checkLength(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="note-content-input">Content</label>
              <textarea name="note-content" />
            </div>
            <div>
              <label htmlFor="note-folder-select">Folder</label>
              <select name="note-f-id">
                <option value={null}>...</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {this.state.verification ? (
                <button type="submit">Add note</button>
              ) : null}
            </div>
          </NotefulForm>
        </section>
      </ErrorBoundary>
    );
  }
}

AddNote.propTypes = {
  history: PropTypes.object,
};
