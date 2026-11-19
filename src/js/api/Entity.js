export default class Entity {
  list() { }

  get() { }

  create(name) {
    return createRequest({
      url: this.URL + '/new-user',
      method: 'POST',
      responseType: 'json',
      body: { name },
    });
  }

  update() { }

  delete() { }
}
