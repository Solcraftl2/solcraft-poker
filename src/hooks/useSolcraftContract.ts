import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    PublicKey, 
    Transaction, 
    TransactionInstruction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { SOLCRAFT_PROGRAM_ID } from '../config/solana';
import { useState, useCallback } from 'react';

// Tournament instruction types
enum TournamentInstruction {
    CreateTournament = 0,
    RegisterPlayer = 1,
    StartTournament = 2,
    EndTournament = 3,
}

export const useSolcraftContract = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = useState(false);

    const programId = new PublicKey(SOLCRAFT_PROGRAM_ID);

    const createTournament = useCallback(async (
        buyIn: number,
        maxPlayers: number,
        startTime: number
    ) => {
        if (!publicKey) throw new Error('Wallet not connected');
        
        setLoading(true);
        try {
            // Create tournament account
            const tournamentKeypair = new PublicKey(
                await PublicKey.createWithSeed(
                    publicKey,
                    'tournament',
                    programId
                )
            );

            // Create instruction data
            const instructionData = Buffer.alloc(1 + 8 + 4 + 8);
            instructionData.writeUInt8(TournamentInstruction.CreateTournament, 0);
            instructionData.writeBigUInt64LE(BigInt(buyIn * LAMPORTS_PER_SOL), 1);
            instructionData.writeUInt32LE(maxPlayers, 9);
            instructionData.writeBigUInt64LE(BigInt(startTime), 13);

            const instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: tournamentKeypair, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                programId,
                data: instructionData,
            });

            const transaction = new Transaction().add(instruction);
            const signature = await sendTransaction(transaction, connection);
            
            await connection.confirmTransaction(signature, 'confirmed');
            
            return {
                signature,
                tournamentId: tournamentKeypair.toString(),
            };
        } catch (error) {
            console.error('Error creating tournament:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, programId]);

    const registerPlayer = useCallback(async (tournamentId: string) => {
        if (!publicKey) throw new Error('Wallet not connected');
        
        setLoading(true);
        try {
            const tournamentPubkey = new PublicKey(tournamentId);
            
            // Create registration account
            const registrationKeypair = new PublicKey(
                await PublicKey.createWithSeed(
                    publicKey,
                    `registration_${tournamentId}`,
                    programId
                )
            );

            const instructionData = Buffer.alloc(1);
            instructionData.writeUInt8(TournamentInstruction.RegisterPlayer, 0);

            const instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: tournamentPubkey, isSigner: false, isWritable: true },
                    { pubkey: registrationKeypair, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                ],
                programId,
                data: instructionData,
            });

            const transaction = new Transaction().add(instruction);
            const signature = await sendTransaction(transaction, connection);
            
            await connection.confirmTransaction(signature, 'confirmed');
            
            return signature;
        } catch (error) {
            console.error('Error registering player:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, programId]);

    const startTournament = useCallback(async (tournamentId: string) => {
        if (!publicKey) throw new Error('Wallet not connected');
        
        setLoading(true);
        try {
            const tournamentPubkey = new PublicKey(tournamentId);

            const instructionData = Buffer.alloc(1);
            instructionData.writeUInt8(TournamentInstruction.StartTournament, 0);

            const instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: tournamentPubkey, isSigner: false, isWritable: true },
                ],
                programId,
                data: instructionData,
            });

            const transaction = new Transaction().add(instruction);
            const signature = await sendTransaction(transaction, connection);
            
            await connection.confirmTransaction(signature, 'confirmed');
            
            return signature;
        } catch (error) {
            console.error('Error starting tournament:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, programId]);

    const endTournament = useCallback(async (tournamentId: string, winner: string) => {
        if (!publicKey) throw new Error('Wallet not connected');
        
        setLoading(true);
        try {
            const tournamentPubkey = new PublicKey(tournamentId);
            const winnerPubkey = new PublicKey(winner);

            const instructionData = Buffer.alloc(1 + 32);
            instructionData.writeUInt8(TournamentInstruction.EndTournament, 0);
            winnerPubkey.toBuffer().copy(instructionData, 1);

            const instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: tournamentPubkey, isSigner: false, isWritable: true },
                ],
                programId,
                data: instructionData,
            });

            const transaction = new Transaction().add(instruction);
            const signature = await sendTransaction(transaction, connection);
            
            await connection.confirmTransaction(signature, 'confirmed');
            
            return signature;
        } catch (error) {
            console.error('Error ending tournament:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [publicKey, sendTransaction, connection, programId]);

    return {
        createTournament,
        registerPlayer,
        startTournament,
        endTournament,
        loading,
        connected: !!publicKey,
    };
};

