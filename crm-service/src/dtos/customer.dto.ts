export class CustomerDTO {
    customerId!: string;
    name!: string;
    email!: string;
    phone!: string;
    address!: string;
    preferredContactMethod!: 'Email' | 'Telefon';
  }  