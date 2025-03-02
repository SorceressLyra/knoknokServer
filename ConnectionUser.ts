export class ConnectionUser {
  name: string;
  isMobile: boolean;
  id: string;

  constructor(name: string, isMobile: boolean, id: string) {
    this.name = name;
    this.isMobile = isMobile;
    this.id = id;
  }
}
