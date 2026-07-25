'use client';

import React, {useState, useMemo} from 'react';
import {format} from 'date-fns';

import {AdminClientData} from '@/actions/admin';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Input} from '@/components/ui/input';

interface ClientsTableProps {
  data: AdminClientData[];
}

export function ClientsTable({data}: ClientsTableProps) {
  const {dict} = useClientDictionary();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof AdminClientData; direction: 'asc' | 'desc'} | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(
        client =>
          client.fullName.toLowerCase().includes(lowercasedTerm) ||
          (client.email && client.email.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  if (!dict) {
    return null; // Or skeleton
  }

  const tableDict = dict.admin.clientsPage.table;

  const requestSort = (key: keyof AdminClientData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder={dict.admin.clientsPage.searchPlaceholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => requestSort('fullName')}>
                {tableDict.name}
              </TableHead>
              <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => requestSort('email')}>
                {tableDict.email}
              </TableHead>
              <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => requestSort('phone')}>
                {tableDict.phone}
              </TableHead>
              <TableHead
                className="hover:bg-muted/50 cursor-pointer text-center"
                onClick={() => requestSort('totalBookings')}>
                {tableDict.totalBookings}
              </TableHead>
              <TableHead
                className="hover:bg-muted/50 cursor-pointer text-center"
                onClick={() => requestSort('sessionsAttended')}>
                {tableDict.sessionsAttended}
              </TableHead>
              <TableHead
                className="hover:bg-muted/50 cursor-pointer text-center"
                onClick={() => requestSort('upcomingBookings')}>
                {tableDict.upcomingBookings}
              </TableHead>
              <TableHead
                className="hover:bg-muted/50 cursor-pointer text-center"
                onClick={() => requestSort('cancelledBookings')}>
                {tableDict.cancelledBookings}
              </TableHead>
              <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => requestSort('lastBookingAt')}>
                {tableDict.lastBooking}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map(client => (
                <TableRow key={client.id}>
                  <TableCell>{client.fullName}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell className="text-center font-medium">{client.totalBookings}</TableCell>
                  <TableCell className="text-center font-medium text-green-600">{client.sessionsAttended}</TableCell>
                  <TableCell className="text-center font-medium">{client.upcomingBookings}</TableCell>
                  <TableCell className="text-center font-medium text-red-600">{client.cancelledBookings}</TableCell>
                  <TableCell>
                    {client.lastBookingAt ? format(new Date(client.lastBookingAt), 'dd.MM.yyyy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {tableDict.noRecords}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
