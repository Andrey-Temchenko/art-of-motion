import React from 'react';

import {getAdminClientsList} from '@/services/adminService';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';

import {ClientsTable} from '@/components/admin/clients/ClientsTable';

export default async function AdminClientsPage(props: {params: Promise<{locale: Locale}>}) {
  const {locale} = await props.params;
  const dict = await getDictionary(locale);
  const clients = await getAdminClientsList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground tracking-tight">{dict.admin.clientsPage.title}</h1>
        <p className="text-muted-foreground">{dict.admin.clientsPage.subtitle}</p>
      </div>

      <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
        <ClientsTable data={clients} />
      </div>
    </div>
  );
}
